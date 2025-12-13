import { TrendingUp } from 'lucide-react'

interface StatCardProps {
    title: string
    value: string
    change: string
    isPositive: boolean
    icon: any
    color: string
}

export function StatCard({ title, value, change, isPositive, icon: Icon, color }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                    <Icon size={24} className={color.replace('bg-', 'text-')} />
                </div>
                <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingUp size={16} className="mr-1 transform rotate-180" />}
                    {change}
                </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    )
}
