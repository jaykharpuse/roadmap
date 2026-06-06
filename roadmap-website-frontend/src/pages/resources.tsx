import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { fetchResources } from "@/state/slices/resourceSlice";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Star, Eye, BookOpen, User, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Resource } from "@/types/user/Resource/Resource";

const ResourceSkeleton = () => (
  <div className="glass rounded-2xl p-5 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-foreground/[0.06]" />
        <div className="h-5 w-40 bg-foreground/[0.06] rounded" />
      </div>
      <div className="h-5 w-16 bg-foreground/[0.06] rounded-full" />
    </div>
    <div className="h-4 w-full bg-foreground/[0.06] rounded mb-1.5" />
    <div className="h-4 w-3/4 bg-foreground/[0.06] rounded mb-3" />
    <div className="flex items-center gap-1.5 mb-3">
      <div className="w-3.5 h-3.5 bg-foreground/[0.06] rounded" />
      <div className="h-4 w-20 bg-foreground/[0.06] rounded" />
    </div>
    <div className="flex gap-1.5">
      {[1, 2, 3].map(i => <div key={i} className="h-5 w-14 bg-foreground/[0.06] rounded-full" />)}
    </div>
  </div>
);

const difficultyStyle = (d?: string) => {
  switch (d?.toLowerCase()) {
    case "beginner":     return "bg-green-500/15 text-green-400 border-green-500/25";
    case "intermediate": return "bg-amber-500/15 text-amber-400 border-amber-500/25";
    case "advanced":     return "bg-rose-500/15 text-rose-400 border-rose-500/25";
    default:             return "bg-orange-500/15 text-orange-400 border-orange-500/25";
  }
};

const Resources: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { resources, loading } = useAppSelector((state) => state.resource);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = "Resources — RoadMapper";
    dispatch(fetchResources());
  }, [dispatch]);

  const filteredResources = useMemo(() => {
    return resources.filter((resource: Resource) => {
      return (
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        resource.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [resources, searchTerm]);

  const formatDuration = (duration?: { value: number; unit: string }) => {
    if (!duration) return null;
    return `${duration.value} ${duration.unit}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[500px] rounded-full bg-orange-500/[0.04] blur-[130px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-600/[0.04] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-rose-500/[0.02] blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-orange-400/70 mb-2">Curated Learning</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            <span className="text-gradient-brand">Resources</span>
          </h1>
          <p className="text-muted-foreground text-base">Explore curated resources to boost your learning</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search resources, tags, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 glass border-border text-foreground placeholder:text-muted-foreground focus:border-orange-500/40 rounded-xl"
            />
          </div>
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <ResourceSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-sm text-muted-foreground mb-5 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              Showing{" "}
              <span className="text-foreground font-medium">{filteredResources.length}</span>
              {" "}of{" "}
              <span className="text-foreground font-medium">{resources.length}</span>
              {" "}resources
            </motion.p>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {filteredResources.map((resource: Resource, i) => (
                <motion.div
                  key={resource._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
                  onClick={() => navigate(`/resources/${resource._id}`)}
                  className="glass card-gradient-border rounded-2xl p-5 cursor-pointer group hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-orange-400" />
                      </div>
                      <h3
                        className="text-base font-semibold text-foreground group-hover:text-orange-400 transition-colors line-clamp-1"
                        style={{ fontFamily: 'Syne, sans-serif' }}
                      >
                        {resource.title}
                      </h3>
                    </div>
                    {resource.difficulty && (
                      <Badge className={`capitalize text-xs border px-2 py-0.5 flex-shrink-0 ${difficultyStyle(resource.difficulty)}`}>
                        {resource.difficulty}
                      </Badge>
                    )}
                  </div>

                  {/* Approved badge */}
                  {resource.isApproved && (
                    <Badge className="mb-2 w-fit bg-green-500/15 text-green-400 border-green-500/25 text-xs">
                      Approved
                    </Badge>
                  )}

                  {/* Description */}
                  {resource.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed flex-1">
                      {resource.description}
                    </p>
                  )}

                  {/* Duration */}
                  {formatDuration(resource.duration) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDuration(resource.duration)}</span>
                    </div>
                  )}

                  {/* Tags */}
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {resource.tags.slice(0, 3).map((tag, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs bg-foreground/[0.03] border-border text-muted-foreground px-2 py-0.5"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-foreground/[0.03] border-border text-muted-foreground px-2 py-0.5"
                        >
                          +{resource.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Stats footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{resource.author || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />{resource.stats?.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400" />{resource.stats?.rating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredResources.length === 0 && (
              <div className="text-center py-16 glass rounded-2xl">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                  No resources found
                </h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Resources;
