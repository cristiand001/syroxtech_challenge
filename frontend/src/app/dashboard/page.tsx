"use client";
import { useEffect, useState } from "react";
import { DollarSign, Package, Tag, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCategories, getProducts, getOrders } from "@/api/services";
import { Category, Product, Order } from "@/types";
import { useLanguage } from "@/context/ContextLanguage";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: any;
  color: string;
}) {
  return (
    <Card className="group transition-all hover:border-primary/30">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="font-display text-3xl font-bold tracking-tight">
          {value}
        </div>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCategories(), getProducts(), getOrders()])
      .then(([c, p, o]) => {
        setCategories(c);
        setProducts(p);
        setOrders(o);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

  const chartData = orders.reduce(
    (acc, o) => {
      const date = new Date(o.createdAt).toLocaleDateString("es", {
        day: "2-digit",
        month: "2-digit",
      });
      const existing = acc.find((d) => d.date === date);
      if (existing) {
        existing.total += o.total;
        existing.orders += 1;
      } else acc.push({ date, total: o.total, orders: 1 });
      return acc;
    },
    [] as { date: string; total: number; orders: number }[],
  );

  const getStatusLabel = (s: string) =>
    ({
      PREPARING: t.statusPreparing,
      SHIPPED: t.statusShipped,
      COMPLETED: t.statusCompleted,
      CANCELLED: t.statusCancelled,
    })[s] ?? s;

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t.revenue}
          value={`$${totalRevenue.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`${orders.length} ${t.orders.toLowerCase()}`}
          icon={DollarSign}
          color="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          label={t.products}
          value={products.length}
          sub={`${categories.length} ${t.categories.toLowerCase()}`}
          icon={Package}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          label={t.categories}
          value={categories.length}
          icon={Tag}
          color="bg-amber-500/10 text-amber-400"
        />
        <StatCard
          label={t.orders}
          value={orders.length}
          icon={ShoppingCart}
          color="bg-pink-500/10 text-pink-400"
        />
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">{t.revenueOverTime}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t.noOrders}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(val: number) => [`$${val.toFixed(2)}`, t.revenue]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#7c3aed"
                  fill="url(#colorTotal)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Tabla órdenes recientes */}
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t.recentSales}</CardTitle>
            <Badge>
              {orders.length} {t.total.toLowerCase()}
            </Badge>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  t.orderNumber,
                  t.customer,
                  t.orderStatus,
                  t.total,
                  t.created,
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-muted-foreground"
                  >
                    {t.noOrders}
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">
                      #{o.orderNumber.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.customerEmail}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={
                          o.status === "COMPLETED"
                            ? "success"
                            : o.status === "CANCELLED"
                              ? "destructive"
                              : "default"
                        }
                      >
                        {getStatusLabel(o.status)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="success">${o.total.toFixed(2)}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}
