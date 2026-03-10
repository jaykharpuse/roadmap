import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CircularProgress } from "./components/circular-progress"
import { BookmarkedRoadmaps } from "./components/bookmarked-resources"
import { RecentlyViewed } from "./components/recently-viewd"
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getUserRoadmapProgressForDashBoard } from "@/state/slices/userProgressSlice"

export default function Dashboard() {
    const dispatch = useAppDispatch();
    const { userCourseProgress, loading } = useAppSelector((state) => state.userProgress);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(getUserRoadmapProgressForDashBoard()).unwrap();
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Progress Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loading && <p className="col-span-3 text-center">Loading courses...</p>}
                    {!loading && userCourseProgress?.length === 0 && (
                        <p className="col-span-3 text-center text-gray-400">No courses found</p>
                    )}
                    {!loading &&
                        userCourseProgress?.map((course) => (
                            <Card
                                key={course.id}
                                className="bg-slate-800/50 border-slate-700 p-6 text-center text-white"
                            >
                                <CircularProgress
                                    percentage={course.percentage}
                                    current={course.current}
                                    total={course.total}
                                />
                                <h3 className="text-xl font-semibold mt-4 mb-4">{course.title}</h3>
                                <Button
                                    variant="outline"
                                    className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 bg-transparent"
                                    onClick={() => navigate(`/details/${course.id}`)}
                                >
                                    Resume
                                </Button>
                            </Card>

                        ))}
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bookmarked Resources */}
                    <div className="lg:col-span-2">
                        <BookmarkedRoadmaps />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <RecentlyViewed />
                    </div>
                </div>
            </div>
        </div>
    );
}
