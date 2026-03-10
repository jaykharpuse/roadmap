import { useState, useMemo } from "react";
import FilterSortBar from "./filter-sort-bar";
import ReviewCard from "./review-card";
export interface PopulatedReview {
  _id: string;
  roadmap: {
    _id: string;
    title: string;
  };
  user: {
    _id: string;
    name: string;
  };
  rating: number;
  title?: string;
  review: string;
  pros?: string[];
  cons?: string[];
  isVerified: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v?: number;
}

export interface GetAllReviewsResponse {
  status: "success";
  results: number;
  data: PopulatedReview[];
}

export const mockReviews: PopulatedReview[] = [
  {
    _id: "review-001",
    roadmap: {
      _id: "roadmap-001",
      title: "Frontend Development Roadmap 2024",
    },
    user: {
      _id: "user-001",
      name: "Yash Choudhary",
    },
    rating: 5,
    title: "Comprehensive and Well-Structured Guide",
    review:
      "This roadmap is absolutely fantastic! It covers everything from the basics to advanced concepts in a logical progression. The step-by-step approach makes it easy to follow, and the resources provided are top-notch. I've been following this for 3 months now and have seen significant improvement in my frontend skills. The community support is also excellent, with active discussions and helpful mentors.",
    pros: [
      "Well organized",
      "Great resources",
      "Active community",
      "Regular updates",
      "Beginner friendly",
    ],
    cons: ["Could use more advanced projects", "Some sections feel rushed"],
    isVerified: true,
    createdAt: "2024-07-22T10:30:00.000Z",
    updatedAt: "2024-07-22T10:30:00.000Z",
    __v: 0,
  },
  {
    _id: "review-002",
    roadmap: {
      _id: "roadmap-002",
      title: "Full Stack JavaScript Developer Path",
    },
    user: {
      _id: "user-002",
      name: "Sarah Chen",
    },
    rating: 4,
    title: "Great for JavaScript Enthusiasts",
    review:
      "As someone who wanted to specialize in JavaScript across the full stack, this roadmap has been incredibly valuable. The progression from frontend to backend concepts is smooth, and the practical projects really help solidify the learning. The Node.js and React sections are particularly well done. However, I wish there was more coverage on testing and deployment strategies.",
    pros: [
      "JavaScript focused",
      "Practical projects",
      "Good progression",
      "Industry relevant",
    ],
    cons: [
      "Limited testing coverage",
      "Deployment section needs work",
      "Could use more TypeScript",
    ],
    isVerified: false,
    createdAt: "2024-07-20T14:15:00.000Z",
    updatedAt: "2024-07-20T14:15:00.000Z",
    __v: 0,
  },
  {
    _id: "review-003",
    roadmap: {
      _id: "roadmap-003",
      title: "DevOps Engineering Fundamentals",
    },
    user: {
      _id: "user-003",
      name: "Michael Rodriguez",
    },
    rating: 5,
    title: "Perfect Introduction to DevOps",
    review:
      "Coming from a traditional development background, this roadmap made DevOps concepts accessible and practical. The hands-on labs with Docker, Kubernetes, and CI/CD pipelines are excellent. What I appreciate most is how it connects the dots between different tools and practices. The real-world scenarios and case studies help understand when and why to use specific technologies.",
    pros: [
      "Hands-on approach",
      "Real-world examples",
      "Great tool coverage",
      "Clear explanations",
      "Industry best practices",
    ],
    cons: ["Steep learning curve initially"],
    isVerified: true,
    createdAt: "2024-07-18T09:45:00.000Z",
    updatedAt: "2024-07-18T09:45:00.000Z",
    __v: 0,
  },
  {
    _id: "review-004",
    roadmap: {
      _id: "roadmap-004",
      title: "Machine Learning for Beginners",
    },
    user: {
      _id: "user-004",
      name: "Priya Patel",
    },
    rating: 3,
    title: "Good Start but Needs More Depth",
    review:
      "This roadmap provides a solid foundation for machine learning concepts, but I found some sections lacking in depth. The mathematical foundations are well explained, and the Python libraries section is comprehensive. However, the practical projects could be more challenging and industry-relevant.",
    pros: [
      "Good mathematical foundation",
      "Comprehensive Python coverage",
      "Clear structure",
    ],
    cons: [
      "Projects too basic",
      "Limited advanced topics",
      "Needs more real-world applications",
      "Outdated some resources",
    ],
    isVerified: false,
    createdAt: "2024-07-15T16:20:00.000Z",
    updatedAt: "2024-07-15T16:20:00.000Z",
    __v: 0,
  },
  {
    _id: "review-005",
    roadmap: {
      _id: "roadmap-005",
      title: "Cybersecurity Specialist Track",
    },
    user: {
      _id: "user-005",
      name: "Alex Thompson",
    },
    rating: 4,
    title: "Comprehensive Security Learning Path",
    review:
      "Excellent coverage of cybersecurity fundamentals with practical labs and simulations. The ethical hacking modules are particularly engaging, and the certification preparation materials are valuable. The roadmap does a great job of covering both defensive and offensive security concepts.",
    pros: [
      "Practical labs",
      "Certification prep",
      "Balanced approach",
      "Up-to-date threats",
      "Expert instructors",
    ],
    cons: ["Heavy time commitment", "Some tools require paid licenses"],
    isVerified: true,
    createdAt: "2024-07-12T11:10:00.000Z",
    updatedAt: "2024-07-12T11:10:00.000Z",
    __v: 0,
  },
];

export default function AllReviewsPage() {
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAndSortedReviews = useMemo(() => {
    let filtered = mockReviews;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.user.name.toLowerCase().includes(query) ||
          review.roadmap.title.toLowerCase().includes(query) ||
          review.title?.toLowerCase().includes(query) ||
          review.review.toLowerCase().includes(query)
      );
    }

    // Filter by rating
    if (filterRating !== "all") {
      const minRating = Number.parseInt(filterRating);
      filtered = filtered.filter((review) => review.rating >= minRating);
    }

    // Sort reviews
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "rating-high":
          return b.rating - a.rating;
        case "rating-low":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return sorted;
  }, [sortBy, filterRating, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sky-400 mb-4">
            Roadmap Reviews
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Discover what our community thinks about different learning
            roadmaps. Read authentic reviews from learners who have walked the
            path.
          </p>
        </div>

        {/* Filter and Sort Bar */}
        <FilterSortBar
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterRating={filterRating}
          setFilterRating={setFilterRating}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-400">
            Showing {filteredAndSortedReviews.length} of {mockReviews.length}{" "}
            reviews
          </p>
        </div>

        {/* Reviews Grid */}
        {filteredAndSortedReviews.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-1">
            {filteredAndSortedReviews.map((review, index) => (
              <div
                key={review._id}
                className="animate-fade-in"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "both",
                }}
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-2">No reviews found</div>
            <p className="text-slate-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
