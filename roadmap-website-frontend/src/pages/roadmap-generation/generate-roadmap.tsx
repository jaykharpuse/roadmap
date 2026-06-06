
import type React from "react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Sparkles,
  Clock,
  Users,
  Star,
  Eye,
  CheckCircle,
  Loader2,
  Zap,
  Target,
  BookOpen,
  FileText,
  Play,
  Award,
  TrendingUp,
  Calendar,
  User,
  AlertCircle,
  RotateCcw,
  Share2,
  Download,
} from "lucide-react"
import { socket, registerUserSocket, connectSocket, cleanupSocket } from "@/helper/useSocket"
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch"
import { generateRoadmap, resetGenerationState } from "@/state/slices/roadmapSlice"
import type { IRoadmap } from "@/types/user/roadmap/roadmap.types"
import { toast } from "sonner"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/authContext"

interface ProgressType {
  step: string
  progress: number
  error?: string
}

const progressSteps = [
  { key: "generating", label: "Creating roadmap...", icon: Sparkles },
  { key: "structuring", label: "Processing response", icon: TrendingUp },
  { key: "saving", label: "Saving roadmap", icon: CheckCircle },
  { key: "complete", label: "Complete!", icon: CheckCircle },
]

const categoryColors: Record<string, string> = {
  frontend: "bg-blue-500",
  backend: "bg-green-500",
  devops: "bg-orange-500",
  mobile: "bg-purple-500",
  "data-science": "bg-pink-500",
  design: "bg-indigo-500",
  "product-management": "bg-yellow-500",
  cybersecurity: "bg-red-500",
  "cyber-security": "bg-red-500",
  cloud: "bg-cyan-500",
  blockchain: "bg-emerald-500",
  other: "bg-gray-500",
}

const difficultyColors = {
  beginner: "bg-green-500",
  intermediate: "bg-yellow-500",
  advanced: "bg-orange-500",
  expert: "bg-red-500",
}

const GenerateRoadmap: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { isLoading, error: reduxError, lastGenerationError, generationAttempts, maxGenerationAttempts } = useAppSelector(state => state.roadmap)

  const [prompt, setPrompt] = useState<string>("")
  const [currentProgress, setCurrentProgress] = useState<ProgressType | null>(null)
  const [generatedRoadmap, setGeneratedRoadmap] = useState<IRoadmap | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [generationTimeout, setGenerationTimeout] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  const generatedNodes = useMemo(() => {
    if (!generatedRoadmap || typeof generatedRoadmap !== "object") return []
    if (!("nodes" in generatedRoadmap)) return []
    const nodes = (generatedRoadmap as { nodes?: unknown }).nodes
    return Array.isArray(nodes) ? nodes : []
  }, [generatedRoadmap])

  // Setup socket listeners
  useEffect(() => {
    // Connect socket and register user
    connectSocket()

    if (user?._id) {
      registerUserSocket(user._id)
    }

    const handleProgressUpdate = ({ step, progress, error: progressError }: ProgressType) => {
      console.log('📊 Progress update:', { step, progress, error: progressError })
      setCurrentProgress({ step, progress, error: progressError })

      const stepIndex = progressSteps.findIndex((s) => s.key === step)
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex)
      }

      // Show info messages briefly, errors more prominently
      if (progressError) {
        if (progressError.toLowerCase().includes('error') || progressError.toLowerCase().includes('failed')) {
          toast.error(`⚠️ ${progressError}`)
        } else if (!progressError.includes('Searching') && !progressError.includes('Checking')) {
          // Info messages - don't spam the user
        }
      }

      // Handle completion
      if (step === 'complete' && progress === 100) {
        setGenerationTimeout(false)
        toast.success("🎉 Roadmap generated successfully!")
      }
    }

    socket.on("roadmap-progress", handleProgressUpdate)

    return () => {
      socket.off("roadmap-progress", handleProgressUpdate)
      cleanupSocket()
    }
  }, [user])

  // Setup generation timeout (3 minutes - increased for AI processing)
  useEffect(() => {
    if (!isLoading) return

    const timeoutId = setTimeout(() => {
      setGenerationTimeout(true)
      toast.warning("⏱️ Generation is taking longer than expected. Please wait or try a simpler prompt.")
    }, 180000) // 3 minutes

    return () => clearTimeout(timeoutId)
  }, [isLoading])

  const getErrorMessage = useCallback((errorText: string): string => {
    if (errorText.includes("timeout")) {
      return "Generation timed out. Please try again with a simpler description."
    }
    if (errorText.includes("too long")) {
      return "Your description is too long. Please keep it under 500 characters."
    }
    if (errorText.includes("too short")) {
      return "Your description is too short. Please provide more details (at least 10 characters)."
    }
    if (errorText.includes("authentication") || errorText.includes("API")) {
      return "Service error. Please contact support or try again later."
    }
    if (errorText.includes("rate limit")) {
      return "Too many requests. Please wait a moment and try again."
    }
    return errorText || "Failed to generate roadmap. Please try again."
  }, [])

  const handleSubmit = async () => {
    if (prompt.trim() === "") {
      toast.error("Please enter what you want to learn")
      return
    }

    if (prompt.trim().length < 10) {
      toast.error("Please provide more details (at least 10 characters)")
      return
    }

    if (prompt.trim().length > 500) {
      toast.error("Please keep your description under 500 characters")
      return
    }

    if (!user) {
      toast.error("Please login to generate roadmaps")
      navigate("/login", { state: { from: location } })
      return
    }

    setGenerationTimeout(false)
    setIsRetrying(false)
    setCurrentProgress(null)
    setGeneratedRoadmap(null)
    setCurrentStep(0)

    try {
      const data = await dispatch(
        generateRoadmap({
          prompt: prompt.trim(),
          isCommunityContributed: false,
          retryAttempt: 1,
        })
      ).unwrap()

      setGeneratedRoadmap(data)
      toast.success("✅ Roadmap generated successfully!")

      setTimeout(() => {
        if (data._id) {
          navigate(`/details/${data._id}`)
        }
      }, 1500)
    } catch (error) {
      const errorMsg = typeof error === "string" ? error : lastGenerationError || "Failed to generate roadmap"
      const friendlyMsg = getErrorMessage(errorMsg)
      toast.error(friendlyMsg)
      console.error('Generation error:', error)
    }
  }

  const handleRetry = async () => {
    if (generationAttempts >= maxGenerationAttempts) {
      toast.error(`Maximum retry attempts (${maxGenerationAttempts}) reached. Please try a different approach.`)
      return
    }

    setIsRetrying(true)
    setGenerationTimeout(false)
    setCurrentProgress(null)
    setGeneratedRoadmap(null)
    setCurrentStep(0)

    try {
      const data = await dispatch(
        generateRoadmap({
          prompt: prompt.trim(),
          isCommunityContributed: false,
          retryAttempt: generationAttempts + 1,
        })
      ).unwrap()

      setGeneratedRoadmap(data)
      toast.success("✅ Roadmap generated successfully!")

      setTimeout(() => {
        if (data._id) {
          navigate(`/details/${data._id}`)
        }
      }, 1500)
    } catch (error) {
      const errorMsg = typeof error === "string" ? error : lastGenerationError || "Failed to generate roadmap"
      const friendlyMsg = getErrorMessage(errorMsg)
      toast.error(friendlyMsg)
    } finally {
      setIsRetrying(false)
    }
  }

  const formatDuration = (duration?: { value: number; unit: string }) => {
    if (!duration) return "Not specified"
    return `${duration.value} ${duration.unit}`
  }

  const getResourceIcon = (type?: string) => {
    const normalized = type?.toLowerCase() || "article"
    if (normalized.includes("video")) return <Play className="w-3 h-3" />
    if (normalized.includes("course")) return <Award className="w-3 h-3" />
    if (normalized.includes("doc")) return <BookOpen className="w-3 h-3" />
    if (normalized.includes("article")) return <FileText className="w-3 h-3" />
    return <BookOpen className="w-3 h-3" />
  }

  const handleShareGenerated = async () => {
    if (!generatedRoadmap?._id) {
      toast.error("Roadmap link not available yet")
      return
    }

    const shareUrl = `${window.location.origin}/details/${generatedRoadmap._id}`
    const shareData = {
      title: generatedRoadmap.title || "Roadmap",
      text: `Check out this learning roadmap: ${generatedRoadmap.title || "Roadmap"}`,
      url: shareUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        toast.success("Shared successfully!")
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success("Link copied to clipboard!")
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success("Link copied to clipboard!")
      } catch {
        toast.error("Failed to share")
      }
    }
  }

  const handleDownloadGenerated = () => {
    if (!generatedRoadmap) {
      toast.error("No roadmap data available")
      return
    }

    const roadmapData = {
      title: generatedRoadmap.title,
      description: generatedRoadmap.description,
      category: generatedRoadmap.category,
      difficulty: generatedRoadmap.difficulty,
      estimatedDuration: generatedRoadmap.estimatedDuration,
      nodes: generatedNodes,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(roadmapData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${(roadmapData.title || "roadmap").replace(/\s+/g, "-").toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Roadmap downloaded!")
  }

  const resetForm = () => {
    dispatch(resetGenerationState())
    setPrompt("")
    setCurrentProgress(null)
    setGeneratedRoadmap(null)
    setCurrentStep(0)
    setGenerationTimeout(false)
    setIsRetrying(false)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-orange-400 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8" />
            AI Roadmap Generator
          </h1>
          <p className="text-foreground text-lg">Generate personalized learning roadmaps with AI assistance</p>
        </motion.div>

        {/* Input Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                What do you want to learn?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-foreground">
                  Describe your learning goal clearly
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="E.g., I want to become a full-stack developer with React and Node.js in 6 months..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground min-h-[120px] resize-none"
                  disabled={isLoading || isRetrying}
                  maxLength={500}
                />
                <div className="text-xs text-muted-foreground">
                  {prompt.length}/500 characters
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || isRetrying || !prompt.trim()}
                  className="flex-1 bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white font-semibold py-3 transition-all duration-200"
                >
                  {isLoading || isRetrying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isRetrying ? "Retrying..." : "Generating..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Roadmap
                    </>
                  )}
                </Button>
                {generatedRoadmap && (
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="border-border text-foreground hover:bg-foreground/[0.06]"
                  >
                    New
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Section */}
        <AnimatePresence>
          {(reduxError || lastGenerationError || generationTimeout) && !isLoading && !isRetrying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="bg-red-500/10 border border-red-500/30 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-3 items-start">
                    <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <h3 className="text-red-400 font-semibold">Generation Failed</h3>
                      <p className="text-foreground text-sm">
                        {getErrorMessage(reduxError || lastGenerationError || generationTimeout ? "timeout" : "")}
                      </p>
                      {generationAttempts > 0 && (
                        <p className="text-muted-foreground text-xs">
                          Attempt {generationAttempts} of {maxGenerationAttempts}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {generationAttempts < maxGenerationAttempts && (
                      <Button
                        onClick={handleRetry}
                        disabled={isLoading || isRetrying}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    )}
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      className="border-border text-foreground hover:bg-foreground/[0.06]"
                    >
                      Try Different Prompt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Section */}
        <AnimatePresence>
          {(isLoading || isRetrying) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <Card className="glass border-border shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isRetrying ? "Retrying Generation" : "Generating Your Roadmap"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overall Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">Overall Progress</span>
                      <span className="text-orange-400 font-medium">{currentProgress?.progress || 0}%</span>
                    </div>
                    <Progress value={currentProgress?.progress || 0} className="h-2 bg-foreground/[0.03]" />
                  </div>

                  {/* Timeout Warning */}
                  {generationTimeout && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <div className="text-sm text-foreground">
                        <p className="font-semibold text-red-400">Generation is taking longer than expected</p>
                        <p className="text-muted-foreground text-xs mt-1">Try retrying with a simpler prompt</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step Progress */}
                  <div className="space-y-4">
                    {progressSteps.map((step, index) => {
                      const Icon = step.icon
                      const isActive = index === currentStep
                      const isCompleted = index < currentStep

                      return (
                        <motion.div
                          key={step.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                            isActive
                              ? "bg-foreground/[0.03] border border-orange-500/40"
                              : isCompleted
                                ? "bg-foreground/[0.03] opacity-75"
                                : "opacity-50"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-full transition-all duration-300 ${
                              isActive
                                ? "bg-orange-500 text-white"
                                : isCompleted
                                  ? "bg-green-500 text-white"
                                  : "bg-foreground/[0.06] text-muted-foreground"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
                            )}
                          </div>
                          <span className={`font-medium ${isActive ? "text-orange-400" : "text-foreground"}`}>
                            {step.label}
                          </span>
                          {isActive && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              className="ml-auto"
                            >
                              <Loader2 className="w-4 h-4 text-orange-400" />
                            </motion.div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generated Roadmap */}
        <AnimatePresence>
          {generatedRoadmap && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Roadmap Header */}
              <Card className="glass border-border shadow-2xl overflow-hidden">
                <div className="relative">
                  {generatedRoadmap.coverImage && (
                    <div className="h-48 bg-gradient-to-r from-orange-500/30 via-rose-500/20 to-violet-600/30 relative">
                      <div className="absolute inset-0 bg-black/20" />
                    </div>
                  )}
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={`${categoryColors[generatedRoadmap.category]} text-white`}>
                        {generatedRoadmap.category}
                      </Badge>
                      {generatedRoadmap.difficulty && (
                        <Badge className={`${difficultyColors[generatedRoadmap.difficulty]} text-white`}>
                          {generatedRoadmap.difficulty}
                        </Badge>
                      )}
                      {generatedRoadmap.isFeatured && (
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>

                    <h2 className="text-3xl font-bold text-orange-400 mb-2">{generatedRoadmap.title}</h2>

                    <p className="text-foreground text-lg leading-relaxed">{generatedRoadmap.description}</p>

                    {generatedRoadmap.longDescription && (
                      <p className="text-muted-foreground leading-relaxed">{generatedRoadmap.longDescription}</p>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="bg-foreground/[0.03] p-4 rounded-lg text-center">
                        <Clock className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                        <div className="text-orange-400 font-semibold">
                          {formatDuration(generatedRoadmap.estimatedDuration)}
                        </div>
                        <div className="text-muted-foreground text-sm">Duration</div>
                      </div>

                      {generatedRoadmap.stats && (
                        <>
                          <div className="bg-foreground/[0.03] p-4 rounded-lg text-center">
                            <Eye className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                            <div className="text-orange-400 font-semibold">
                              {generatedRoadmap.stats?.views?.toLocaleString() || "0"}
                            </div>
                            <div className="text-muted-foreground text-sm">Views</div>
                          </div>

                          <div className="bg-foreground/[0.03] p-4 rounded-lg text-center">
                            <Users className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                            <div className="text-orange-400 font-semibold">
                              {generatedRoadmap.stats?.completions?.toLocaleString() || "0"}
                            </div>
                            <div className="text-muted-foreground text-sm">Completions</div>
                          </div>

                          <div className="bg-foreground/[0.03] p-4 rounded-lg text-center">
                            <Star className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                            <div className="text-orange-400 font-semibold">
                              {generatedRoadmap.stats?.averageRating?.toFixed(1) || "0.0"}
                            </div>
                            <div className="text-muted-foreground text-sm">Rating</div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Tags */}
                    {generatedRoadmap.tags && generatedRoadmap.tags.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-orange-400 font-semibold">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {generatedRoadmap.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="border-border text-foreground">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Learning Path Preview */}
                    {generatedNodes.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-border">
                        <h4 className="text-orange-400 font-semibold flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Learning Path ({generatedNodes.length} sections)
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                          {generatedNodes.map((node: any, index: number) => (
                            <div 
                              key={node._id || index} 
                              className="flex items-start gap-3 p-3 bg-foreground/[0.03] rounded-lg hover:bg-foreground/[0.06] transition-colors"
                            >
                              <div className="flex items-center justify-center w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-foreground font-medium truncate">{node.title}</div>
                                {node.description && (
                                  <p className="text-muted-foreground text-sm line-clamp-1">{node.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  {node.estimatedDuration && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {node.estimatedDuration.value} {node.estimatedDuration.unit}
                                    </span>
                                  )}
                                  {node.children?.length > 0 && (
                                    <span>• {node.children.length} subtopics</span>
                                  )}
                                  {node.resources?.length > 0 && (
                                    <span>• {node.resources.length} resources</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources Preview */}
                    {generatedNodes.some((node: any) => node.resources?.length > 0) && (
                      <div className="space-y-3 pt-4 border-t border-border">
                        <h4 className="text-orange-400 font-semibold flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Resources Preview
                        </h4>
                        <div className="space-y-3">
                          {generatedNodes
                            .filter((node: any) => node.resources?.length > 0)
                            .slice(0, 3)
                            .map((node: any, index: number) => (
                              <div key={index} className="bg-foreground/[0.03] rounded-lg p-3">
                                <div className="text-foreground text-sm font-semibold mb-2">{node.title}</div>
                                <div className="flex flex-wrap gap-2">
                                  {node.resources.slice(0, 4).map((resource: any, rIndex: number) => (
                                    <span
                                      key={rIndex}
                                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-foreground/[0.04] text-orange-400 rounded-md"
                                    >
                                      {getResourceIcon(resource.resourceType || resource.type)}
                                      {resource.title}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Prerequisites */}
                    {generatedRoadmap.prerequisites && generatedRoadmap.prerequisites.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-orange-400 font-semibold flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Prerequisites
                        </h4>
                        <div className="space-y-1">
                          {generatedRoadmap.prerequisites.map((prereq: any, index: number) => (
                            <div key={index} className="text-foreground text-sm">
                              • {typeof prereq === 'string' ? prereq : prereq.title || 'Unknown'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contributor */}
                    {generatedRoadmap.contributor && (
                      <div className="flex items-center gap-3 pt-4 border-t border-border">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-foreground font-medium">{generatedRoadmap.contributor?.username || "Unknown"}</div>
                          <div className="text-muted-foreground text-sm">Contributor</div>
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-border text-sm text-muted-foreground">
                      {generatedRoadmap.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Published: {generatedRoadmap.publishedAt && !isNaN(new Date(generatedRoadmap.publishedAt).getTime()) ? new Date(generatedRoadmap.publishedAt).toLocaleDateString() : "N/A"}
                        </div>
                      )}
                      {generatedRoadmap.version && (
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          Version: {generatedRoadmap.version}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  className="bg-gradient-to-r from-orange-500 via-rose-500 to-violet-600 text-white"
                  onClick={() => {
                    if (generatedRoadmap._id) {
                      navigate(`/details/${generatedRoadmap._id}`)
                    }
                  }}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Start Learning
                </Button>
                <Button 
                  variant="outline" 
                  className="border-border text-foreground hover:bg-foreground/[0.06]"
                  onClick={resetForm}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Another
                </Button>
                <Button
                  variant="outline"
                  className="border-border text-foreground hover:bg-foreground/[0.06]"
                  onClick={handleShareGenerated}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  className="border-border text-foreground hover:bg-foreground/[0.06]"
                  onClick={handleDownloadGenerated}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default GenerateRoadmap
