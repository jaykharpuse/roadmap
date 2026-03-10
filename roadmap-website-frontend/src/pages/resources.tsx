import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { fetchResources } from "@/state/slices/resourceSlice";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, Star, Eye, BookOpen, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Resource } from "@/types/user/Resource/Resource";

const ResourceSkeleton = () => (
  <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
    <CardHeader className="space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-3/4 bg-slate-700" />
        <Skeleton className="h-5 w-16 bg-slate-700" />
      </div>
      <Skeleton className="h-4 w-full bg-slate-700" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 bg-slate-700" />
        <Skeleton className="h-4 w-20 bg-slate-700" />
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-6 w-16 bg-slate-700" />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24 bg-slate-700" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-12 bg-slate-700" />
          <Skeleton className="h-4 w-12 bg-slate-700" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const Resources: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { resources, loading } = useAppSelector((state) => state.resource);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = "Resources";
    dispatch(fetchResources());
  }, [dispatch]);

  const filteredResources = useMemo(() => {
    return resources.filter((resource: Resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        resource.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [resources, searchTerm]);

  const formatDuration = (duration?: { value: number; unit: string }) => {
    if (!duration) return "Duration not specified";
    return `${duration.value} ${duration.unit}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-sky-400 mb-2">Resources</h1>
          <p className="text-slate-300">Explore curated resources to boost your learning</p>
        </div>

        {/* Search */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search resources, tags, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-slate-200 placeholder-slate-400 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <ResourceSkeleton key={index} />
            ))}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-slate-400">
                Showing {filteredResources.length} of {resources.length} resources
              </p>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredResources.map((resource: Resource) => (
                <Card
                  key={resource._id}
                  onClick={() => navigate(`/resources/${resource._id}`)}
                  className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 group cursor-pointer"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-sky-400 group-hover:text-sky-300 transition-colors">
                            {resource.title}
                          </CardTitle>
                          {resource.isApproved && (
                            <Badge className="mt-1 bg-green-500/20 text-green-400 border-green-500/30">
                              Approved
                            </Badge>
                          )}
                        </div>
                      </div>
                      {resource.difficulty && (
                        <Badge className={`capitalize bg-blue-500/10 text-blue-400 border-blue-500/30`}>
                          {resource.difficulty}
                        </Badge>
                      )}
                    </div>

                    <CardDescription className="text-slate-300 line-clamp-2">{resource.description}</CardDescription>

                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(resource.duration)}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Tags */}
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {resource.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-400 border-slate-600">
                            +{resource.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{resource.author || "Unknown"}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{resource.stats?.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          <span>{resource.stats?.rating?.toFixed(1) || "0.0"}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredResources.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-300 mb-2">No resources found</h3>
                <p className="text-slate-400">Try adjusting your search criteria</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Resources;
