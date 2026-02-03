"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Users, FileText, MousePointer2 } from "lucide-react"


const getCountryName = (code: string) => {
    const names: Record<string, string> = {
        "MX": "México", "US": "Estados Unidos", "CO": "Colombia", "ES": "España",
        "AR": "Argentina", "CL": "Chile", "PE": "Perú", "SV": "El Salvador",
        "XX": "Desconocido",
    }
    return names[code] || code
}

interface AnalyticsDashboardProps {
    data: {
        summary: {
            visitors: number
            pageViews: number
            bounceRate: string
        }
        topPages: { name: string; value: number }[]
        topReferrers: { name: string; value: number }[]
        topCountries: { country: string; visits: number }[]
        topOS: { name: string; value: number }[]
        topDevices: { name: string; value: number }[]
    }
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
    // Mock trend data for the area chart (simulating last 7 days)
    // Ideally this would come from the API as time-series data
    const chartData = [
        { name: "Mon", visitors: Math.floor(data.summary.visitors * 0.1), views: Math.floor(data.summary.pageViews * 0.1) },
        { name: "Tue", visitors: Math.floor(data.summary.visitors * 0.15), views: Math.floor(data.summary.pageViews * 0.12) },
        { name: "Wed", visitors: Math.floor(data.summary.visitors * 0.2), views: Math.floor(data.summary.pageViews * 0.25) },
        { name: "Thu", visitors: Math.floor(data.summary.visitors * 0.1), views: Math.floor(data.summary.pageViews * 0.1) },
        { name: "Fri", visitors: Math.floor(data.summary.visitors * 0.25), views: Math.floor(data.summary.pageViews * 0.3) },
        { name: "Sat", visitors: Math.floor(data.summary.visitors * 0.15), views: Math.floor(data.summary.pageViews * 0.1) },
        { name: "Sun", visitors: Math.floor(data.summary.visitors * 0.05), views: Math.floor(data.summary.pageViews * 0.03) },
    ]

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Visitors</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-3xl font-bold">{data.summary.visitors}</h3>
                                <span className="text-xs font-medium text-red-500 bg-red-100 px-1.5 py-0.5 rounded">-12%</span>
                            </div>
                        </div>
                        <Users className="w-8 h-8 text-primary/20" />
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-3xl font-bold">{data.summary.pageViews}</h3>
                                <span className="text-xs font-medium text-green-500 bg-green-100 px-1.5 py-0.5 rounded">+5%</span>
                            </div>
                        </div>
                        <FileText className="w-8 h-8 text-primary/20" />
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-3xl font-bold">{data.summary.bounceRate}</h3>
                                <span className="text-xs font-medium text-green-500 bg-green-100 px-1.5 py-0.5 rounded">+2%</span>
                            </div>
                        </div>
                        <MousePointer2 className="w-8 h-8 text-primary/20" />
                    </div>
                </Card>
            </div>

            {/* Main Chart */}
            <Card className="p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold">Traffic Overview</h3>
                    <p className="text-sm text-muted-foreground">Visitors vs Page Views (Last 7 Days)</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="var(--color-muted-foreground)" />
                        <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                        />
                        <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                        <Area type="monotone" dataKey="visitors" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitors)" />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            {/* Detailed Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Row 1, Col 1: Pages */}
                <Card className="p-0 overflow-hidden">
                    <div className="p-4 border-b bg-muted/30">
                        <h4 className="font-semibold">Top Pages</h4>
                    </div>
                    <div className="divide-y max-h-[300px] overflow-y-auto">
                        {data.topPages.map((page, i) => (
                            <div key={i} className="flex justify-between items-center p-3 text-sm hover:bg-muted/50">
                                <span className="truncate max-w-[70%] font-medium">{page.name}</span>
                                <span className="text-muted-foreground">{page.value} views</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Row 1, Col 2: Referrers */}
                <Card className="p-0 overflow-hidden">
                    <div className="p-4 border-b bg-muted/30">
                        <h4 className="font-semibold">Top Referrers</h4>
                    </div>
                    <div className="divide-y max-h-[300px] overflow-y-auto">
                        {data.topReferrers.map((ref, i) => (
                            <div key={i} className="flex justify-between items-center p-3 text-sm hover:bg-muted/50">
                                <span className="truncate max-w-[70%] text-blue-600 font-medium">{ref.name}</span>
                                <span className="text-muted-foreground">{ref.value}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Row 2, Col 1: Countries */}
                <Card className="p-0 overflow-hidden">
                    <div className="p-4 border-b bg-muted/30">
                        <h4 className="font-semibold">Countries</h4>
                    </div>
                    <div className="divide-y max-h-[300px] overflow-y-auto">
                        {data.topCountries.map((c, i) => (
                            <div key={i} className="flex justify-between items-center p-3 text-sm hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                    {c.country === 'XX' ? (
                                        <div className="w-6 h-4 bg-muted flex items-center justify-center rounded-sm text-[10px] border">?</div>
                                    ) : (
                                        <img
                                            src={`https://flagcdn.com/w40/${c.country.toLowerCase()}.png`}
                                            alt={c.country}
                                            className="w-6 h-auto rounded-sm object-cover shadow-sm border"
                                        />
                                    )}
                                    <span className="font-medium">{getCountryName(c.country)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${(c.visits / Math.max(...data.topCountries.map(x => x.visits))) * 100}%` }}></div>
                                    </div>
                                    <span className="text-muted-foreground w-8 text-right">{c.visits}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Row 2, Col 2: Tech Specs (Tabs) */}
                <Card className="p-0 overflow-hidden flex flex-col">
                    <Tabs defaultValue="devices" className="w-full">
                        <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
                            <h4 className="font-semibold px-1">Tech Specs</h4>
                            <TabsList className="h-8">
                                <TabsTrigger value="devices" className="text-xs h-7">Devices</TabsTrigger>
                                <TabsTrigger value="os" className="text-xs h-7">OS</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="devices" className="m-0">
                            <div className="divide-y max-h-[300px] overflow-y-auto">
                                {data.topDevices.map((d, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 text-sm hover:bg-muted/50">
                                        <span className="font-medium">{d.name}</span>
                                        <span className="text-muted-foreground">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="os" className="m-0">
                            <div className="divide-y max-h-[300px] overflow-y-auto">
                                {data.topOS.map((o, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 text-sm hover:bg-muted/50">
                                        <span className="font-medium">{o.name}</span>
                                        <span className="text-muted-foreground">{o.value}</span>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    )
}
