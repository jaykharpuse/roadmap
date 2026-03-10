import { Card } from "@/components/ui/card"

const completedSteps = [
  {
    date: "Apr 14",
    title: "HTML > Forms > Validations",
    category: "",
  },
  {
    date: "Apr 11",
    title: "Prompt Engineering",
    category: "Fundamentals",
  },
  {
    date: "Apr 03",
    title: "HTML > Learn the Basics",
    category: "",
  },
]

export function CompletedSteps() {
  return (
    <Card className="bg-slate-800/50 border-slate-700 p-6">
      <h2 className="text-xl font-semibold mb-6">Completed Steps</h2>

      <div className="space-y-4">
        {completedSteps.map((step, index) => (
          <div key={index} className="flex justify-between items-start">
            <div className="text-sm text-slate-400 min-w-[50px]">{step.date}</div>
            <div className="flex-1 ml-4">
              <div className="font-medium text-sm">{step.title}</div>
              {step.category && <div className="text-xs text-slate-400 mt-1">{step.category}</div>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
