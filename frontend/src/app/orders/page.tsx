"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  Eye,
  Trash2,
  Loader2,
  Package,
  X,
  Search,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/toaster";
import {
  getOrders,
  getProducts,
  createOrder,
  updateOrder,
  deleteOrder,
} from "@/api/services";
import { useToast } from "@/hooks/useToast";
import { Order, Product, OrderStatus } from "@/types";
import { useLanguage } from "@/context/ContextLanguage";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  paymentMethod: string;
  paymentStatus: string;
  notes: string;
}

interface OrderItemInput {
  productId: number;
  quantity: number;
}

const EMPTY_FORM: OrderForm = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  address: "",
  paymentMethod: "CASH",
  paymentStatus: "PENDING",
  notes: "",
};

const statusVariant: Record<
  OrderStatus,
  "default" | "success" | "destructive" | "warning"
> = {
  PREPARING: "warning",
  SHIPPED: "default",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

export default function OrdersPage() {
  const { t } = useLanguage();
  const { toasts, toast, dismiss } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [modal, setModal] = useState<"create" | "detail" | "delete" | null>(
    null,
  );
  const [selected, setSelected] = useState<Order | null>(null);
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);
  const [items, setItems] = useState<OrderItemInput[]>([
    { productId: 0, quantity: 1 },
  ]);
  const [saving, setSaving] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [paymentStatusUpdate, setPaymentStatusUpdate] = useState("");
  const [trackingUpdate, setTrackingUpdate] = useState("");

  const load = () =>
    Promise.all([getOrders(), getProducts()])
      .then(([o, p]) => {
        setOrders(o);
        setFiltered(o);
        setProducts(p);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      orders.filter((o) => {
        const matchSearch =
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          o.orderNumber.toLowerCase().includes(q);
        const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    );
  }, [search, statusFilter, orders]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setItems([{ productId: products[0]?.id ?? 0, quantity: 1 }]);
    setModal("create");
  };

  const openDetail = (o: Order) => {
    setSelected(o);
    setStatusUpdate(o.status);
    setPaymentStatusUpdate(o.paymentStatus);
    setTrackingUpdate(o.trackingNumber ?? "");
    setStatusNote("");
    setModal("detail");
  };

  const openDelete = (o: Order) => {
    setSelected(o);
    setModal("delete");
  };
  const close = () => {
    setModal(null);
    setSelected(null);
  };
  const setF = (key: keyof OrderForm) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const addItem = () =>
    setItems((p) => [...p, { productId: products[0]?.id ?? 0, quantity: 1 }]);
  const removeItem = (i: number) =>
    setItems((p) => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, key: keyof OrderItemInput, val: number) =>
    setItems((p) =>
      p.map((item, idx) => (idx === i ? { ...item, [key]: val } : item)),
    );

  const getPrice = (id: number) =>
    products.find((p) => p.id === id)?.price ?? 0;
  const previewTotal = items.reduce(
    (acc, i) => acc + getPrice(i.productId) * i.quantity,
    0,
  );

  const getStatusLabel = (s: OrderStatus) =>
    ({
      PREPARING: t.statusPreparing,
      SHIPPED: t.statusShipped,
      COMPLETED: t.statusCompleted,
      CANCELLED: t.statusCancelled,
    })[s];

  const getPaymentMethodLabel = (m: string) =>
    ({
      CARD: t.paymentCard,
      CASH: t.paymentCash,
      TRANSFER: t.paymentTransfer,
    })[m] ?? m;

  const getPaymentStatusLabel = (s: string) =>
    ({
      PAID: t.paymentPaid,
      PENDING: t.paymentPending,
      FAILED: t.paymentFailed,
    })[s] ?? s;
  const exportCSV = () => {
    const headers = [
      "Orden",
      "Cliente",
      "Email",
      "Teléfono",
      "Estado",
      "Pago",
      "Total",
      "Tracking",
      "Fecha",
    ];
    const rows = filtered.map((o) => [
      o.orderNumber.slice(-8).toUpperCase(),
      o.customerName,
      o.customerEmail,
      o.customerPhone ?? "",
      getStatusLabel(o.status),
      getPaymentStatusLabel(o.paymentStatus),
      `$${o.total.toFixed(2)}`,
      o.trackingNumber ?? "",
      new Date(o.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ordenes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleCreate = async () => {
    if (!form.customerName.trim()) {
      toast({
        title: t.fieldRequired,
        description: t.customerName + " requerido",
        variant: "destructive",
      });
      return;
    }
    if (!form.customerEmail.trim()) {
      toast({
        title: t.fieldRequired,
        description: t.customerEmail + " requerido",
        variant: "destructive",
      });
      return;
    }
    if (items.some((i) => !i.productId)) {
      toast({
        title: t.productRequired,
        description: t.productRequiredDesc,
        variant: "destructive",
      });
      return;
    }
    if (items.some((i) => i.quantity < 1)) {
      toast({
        title: t.invalidQty,
        description: t.invalidQtyDesc,
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      await createOrder({ ...form, items });
      toast({ title: t.orderCreated, variant: "success" });
      await load();
      close();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast({
        title: t.genericError,
        description: Array.isArray(msg)
          ? msg[0]
          : (msg ?? t.errorCreatingOrder),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selected || !statusUpdate) return;
    setSaving(true);
    try {
      await updateOrder(selected.id, {
        status: statusUpdate,
        paymentStatus: paymentStatusUpdate,
        trackingNumber: trackingUpdate,
        note: statusNote,
      });
      toast({ title: t.orderUpdated, variant: "success" });
      await load();
      close();
    } catch {
      toast({
        title: t.genericError,
        description: t.errorSaving,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await deleteOrder(selected.id);
      toast({ title: t.orderDeleted, variant: "success" });
      await load();
      close();
    } catch {
      toast({
        title: t.genericError,
        description: t.errorDeleting,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <Toaster toasts={toasts} dismiss={dismiss} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t.ordersTotal(orders.length)}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            disabled={filtered.length === 0}
          >
            <Download className="h-4 w-4" /> {t.exportCSV}
          </Button>
          <Button
            size="sm"
            onClick={openCreate}
            disabled={products.length === 0}
          >
            <Plus className="h-4 w-4" /> {t.newOrder}
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t.searchOrders}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t.allStatuses}</SelectItem>
              <SelectItem value="PREPARING">{t.statusPreparing}</SelectItem>
              <SelectItem value="SHIPPED">{t.statusShipped}</SelectItem>
              <SelectItem value="COMPLETED">{t.statusCompleted}</SelectItem>
              <SelectItem value="CANCELLED">{t.statusCancelled}</SelectItem>
            </SelectContent>
          </Select>
          {(search || statusFilter !== "ALL") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
            >
              <X className="h-4 w-4" /> {t.clear}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {t.showing(filtered.length, orders.length)}
        </p>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  t.orderNumber,
                  t.customer,
                  t.orderStatus,
                  t.total,
                  t.paymentMethod,
                  t.paymentStatus,
                  t.tracking,
                  t.actions,
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground ${h === t.actions ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    {t.noOrders}
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-mono text-xs font-bold text-primary">
                        #{o.orderNumber.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.customerEmail}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={statusVariant[o.status]}>
                        {getStatusLabel(o.status)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="success">${o.total.toFixed(2)}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {getPaymentMethodLabel(o.paymentMethod)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={
                          o.paymentStatus === "PAID"
                            ? "success"
                            : o.paymentStatus === "FAILED"
                              ? "destructive"
                              : "default"
                        }
                      >
                        {getPaymentStatusLabel(o.paymentStatus)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {o.trackingNumber ? (
                        <span className="font-mono text-xs text-primary">
                          {o.trackingNumber}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetail(o)}
                        >
                          <Eye className="h-3.5 w-3.5" /> {t.manageOrder}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDelete(o)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      <Dialog open={modal === "create"} onOpenChange={close}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.newOrder}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                {t.customerInfo}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t.customerName}</Label>
                  <Input
                    autoFocus
                    value={form.customerName}
                    onChange={(e) => setF("customerName")(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.customerEmail}</Label>
                  <Input
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => setF("customerEmail")(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.phone}</Label>
                  <Input
                    value={form.customerPhone}
                    onChange={(e) => setF("customerPhone")(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.address}</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => setF("address")(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                {t.paymentInfo}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t.paymentMethod}</Label>
                  <Select
                    value={form.paymentMethod}
                    onValueChange={setF("paymentMethod")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CARD">{t.paymentCard}</SelectItem>
                      <SelectItem value="CASH">{t.paymentCash}</SelectItem>
                      <SelectItem value="TRANSFER">
                        {t.paymentTransfer}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t.paymentStatus}</Label>
                  <Select
                    value={form.paymentStatus}
                    onValueChange={setF("paymentStatus")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAID">{t.paymentPaid}</SelectItem>
                      <SelectItem value="PENDING">
                        {t.paymentPending}
                      </SelectItem>
                      <SelectItem value="FAILED">{t.paymentFailed}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                {t.products}
              </p>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-[2] space-y-1.5">
                      {idx === 0 && <Label>{t.products}</Label>}
                      <Select
                        value={String(item.productId)}
                        onValueChange={(v) =>
                          updateItem(idx, "productId", parseInt(v))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.selectProduct} />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name} — ${p.price.toFixed(2)} ({p.stock}{" "}
                              {t.units})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {idx === 0 && <Label>{t.qty}</Label>}
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            idx,
                            "quantity",
                            parseInt(e.target.value) || 1,
                          )
                        }
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addItem}>
                  {t.addProduct}
                </Button>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3 border border-border">
                  <span className="text-sm text-muted-foreground">
                    {t.estimatedTotal}
                  </span>
                  <span className="font-display text-xl font-bold text-emerald-400">
                    ${previewTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t.noteOptional}</Label>
              <Input
                value={form.notes}
                onChange={(e) => setF("notes")(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              {t.cancel}
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? t.creatingSale : t.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={modal === "detail"} onOpenChange={close}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t.manageOrder} — #{selected?.orderNumber.slice(-8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5 py-2">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t.currentStatus}
                  </p>
                  <Badge variant={statusVariant[selected.status]}>
                    {getStatusLabel(selected.status)}
                  </Badge>
                </div>
                <p className="ml-auto text-xs text-muted-foreground font-mono">
                  {selected.orderNumber.slice(-8).toUpperCase()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t.customerInfo}
                  </p>
                  <p className="font-medium">{selected.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selected.customerEmail}
                  </p>
                  {selected.customerPhone && (
                    <p className="text-sm text-muted-foreground">
                      {selected.customerPhone}
                    </p>
                  )}
                </div>
                <div className="rounded-lg border border-border p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t.paymentInfo}
                  </p>
                  <p className="text-sm">
                    {getPaymentMethodLabel(selected.paymentMethod)}
                  </p>
                  <Badge
                    variant={
                      selected.paymentStatus === "PAID"
                        ? "success"
                        : selected.paymentStatus === "FAILED"
                          ? "destructive"
                          : "default"
                    }
                  >
                    {getPaymentStatusLabel(selected.paymentStatus)}
                  </Badge>
                  <p className="font-display text-lg font-bold text-emerald-400">
                    ${selected.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t.shipmentInfo}
                </p>
                {selected.address ? (
                  <p className="text-sm text-muted-foreground">
                    {selected.address}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
                {selected.trackingNumber && (
                  <p className="text-sm font-mono text-primary">
                    {t.tracking}: {selected.trackingNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t.items}
                </p>
                {selected.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {item.product?.image ? (
                        <img
                          src={item.product.image}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {item.product?.name ?? `#${item.productId}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t.orderHistory}
                </p>
                {selected.history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t.noHistory}</p>
                ) : (
                  selected.history.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-start gap-3 rounded-lg bg-muted/30 px-4 py-3"
                    >
                      <Badge
                        variant={statusVariant[h.status]}
                        className="shrink-0"
                      >
                        {getStatusLabel(h.status)}
                      </Badge>
                      <div className="flex-1">
                        {h.note && <p className="text-sm">{h.note}</p>}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(h.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded-lg border border-border p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t.availableActions}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t.orderStatus}</Label>
                    <Select
                      value={statusUpdate}
                      onValueChange={setStatusUpdate}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PREPARING">
                          {t.statusPreparing}
                        </SelectItem>
                        <SelectItem value="SHIPPED">
                          {t.statusShipped}
                        </SelectItem>
                        <SelectItem value="COMPLETED">
                          {t.statusCompleted}
                        </SelectItem>
                        <SelectItem value="CANCELLED">
                          {t.statusCancelled}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t.paymentStatus}</Label>
                    <Select
                      value={paymentStatusUpdate}
                      onValueChange={setPaymentStatusUpdate}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PAID">{t.paymentPaid}</SelectItem>
                        <SelectItem value="PENDING">
                          {t.paymentPending}
                        </SelectItem>
                        <SelectItem value="FAILED">
                          {t.paymentFailed}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>{t.tracking}</Label>
                    <Input
                      placeholder="ABC123..."
                      value={trackingUpdate}
                      onChange={(e) => setTrackingUpdate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t.noteOptional}</Label>
                  <Input
                    placeholder={t.addNote}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleUpdateStatus}
                  disabled={saving}
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? t.updating : t.updateStatus}
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              {t.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={modal === "delete"} onOpenChange={close}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.deleteOrderTitle}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t.deleteOrderDesc(
              selected?.orderNumber.slice(-8).toUpperCase() ?? "",
            )}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              {t.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Loader() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
      <div className="rounded-xl border border-border p-3 space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-[180px]" />
        </div>
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-5 py-3 flex gap-8">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-3 w-16" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="border-b border-border/50 px-5 py-4 flex gap-8 items-center"
          >
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-3 w-16" />
            <div className="flex gap-2 ml-auto">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
