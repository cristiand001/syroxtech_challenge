"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Search, X, Upload } from "lucide-react";
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
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/api/services";
import { useToast } from "@/hooks/useToast";
import { Product, Category } from "@/types";
import { useLanguage } from "@/context/ContextLanguage";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  brand: string;
  stock: string;
  status: string;
  image: string;
  categoryId: string;
}

const EMPTY: ProductForm = {
  name: "",
  description: "",
  price: "",
  brand: "",
  stock: "0",
  status: "true",
  image: "",
  categoryId: "",
};

export default function ProductsPage() {
  const { t } = useLanguage();
  const { toasts, toast, dismiss } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () =>
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => {
        setProducts(p);
        setFiltered(p);
        setCategories(c);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q),
      ),
    );
  }, [search, products]);

  const openCreate = () => {
    setForm(EMPTY);
    setModal("create");
  };
  const openEdit = (p: Product) => {
    setSelected(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      brand: p.brand ?? "",
      stock: String(p.stock),
      status: String(p.status),
      image: p.image ?? "",
      categoryId: String(p.categoryId),
    });
    setModal("edit");
  };
  const openDelete = (p: Product) => {
    setSelected(p);
    setModal("delete");
  };
  const close = () => {
    setModal(null);
    setSelected(null);
    setForm(EMPTY);
  };
  const set = (key: keyof ProductForm) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({
        title: t.fieldRequired,
        description: t.productNameRequired,
        variant: "destructive",
      });
      return;
    }
    if (!form.description.trim()) {
      toast({
        title: t.fieldRequired,
        description: t.descriptionRequired,
        variant: "destructive",
      });
      return;
    }
    if (!form.brand.trim()) {
      toast({
        title: t.fieldRequired,
        description: t.brandRequired,
        variant: "destructive",
      });
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      toast({
        title: t.invalidPrice,
        description: t.invalidPriceDesc,
        variant: "destructive",
      });
      return;
    }
    if (form.stock === "" || parseInt(form.stock) < 0) {
      toast({
        title: t.fieldRequired,
        description: t.stockRequired,
        variant: "destructive",
      });
      return;
    }
    if (!form.categoryId) {
      toast({
        title: t.categoryRequired,
        description: t.categoryRequiredDesc,
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        brand: form.brand.trim(),
        stock: parseInt(form.stock),
        status: form.status === "true",
        image: form.image.trim() || undefined,
        categoryId: parseInt(form.categoryId),
      };
      if (modal === "create") await createProduct(payload);
      else if (selected) await updateProduct(selected.id, payload);
      toast({
        title: modal === "create" ? t.productCreated : t.productUpdated,
        variant: "success",
      });
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
      await deleteProduct(selected.id);
      toast({ title: t.productDeleted, variant: "success" });
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t.productsTotal(products.length)}
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> {t.newProduct}
        </Button>
      </div>

      {/* Search */}
      <Card className="p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t.searchProducts}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <Button variant="outline" size="sm" onClick={() => setSearch("")}>
              <X className="h-4 w-4" /> {t.clear}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {t.showing(filtered.length, products.length)}
        </p>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  t.name,
                  t.category,
                  t.brand,
                  t.stock,
                  t.price,
                  t.status,
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
                    colSpan={7}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg object-cover bg-muted shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Upload className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium leading-tight">{p.name}</p>
                          {p.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">
                              {p.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge>{p.category?.name ?? "—"}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {p.brand ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={p.stock > 0 ? "default" : "destructive"}>
                        {p.stock} {t.units}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="success">${p.price.toFixed(2)}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={p.stock > 0 ? "success" : "destructive"}>
                        {p.stock > 0 ? t.active : t.inactive}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDelete(p)}
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

      {/* Create / Edit Modal */}
      <Dialog
        open={modal === "create" || modal === "edit"}
        onOpenChange={close}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {modal === "create" ? t.newProduct : `${t.edit} ${t.products}`}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label>{t.productName}</Label>
              <Input
                autoFocus
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>{t.description}</Label>
              <Input
                value={form.description}
                onChange={(e) => set("description")(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.price}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price")(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.brand}</Label>
              <Input
                value={form.brand}
                onChange={(e) => set("brand")(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.stock}</Label>
              <Input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => set("stock")(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.status}</Label>
              <Select value={form.status} onValueChange={set("status")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">{t.active}</SelectItem>
                  <SelectItem value="false">{t.inactive}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t.category}</Label>
              <Select value={form.categoryId} onValueChange={set("categoryId")}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectCategory} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t.imageUrl}</Label>
              <Input
                value={form.image}
                onChange={(e) => set("image")(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              {t.cancel}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {modal === "create" ? t.create : t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={modal === "delete"} onOpenChange={close}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.deleteProductTitle}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t.deleteProductDesc(selected?.name ?? "")}
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
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}
