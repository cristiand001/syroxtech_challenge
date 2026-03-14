"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/services";
import { useToast } from "@/hooks/useToast";
import { Category } from "@/types";
import { useLanguage } from "@/context/languageContext";

export default function CategoriesPage() {
  const { t } = useLanguage();
  const { toasts, toast, dismiss } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("none");
  const [saving, setSaving] = useState(false);

  const load = () =>
    getCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setName("");
    setParentId("none");
    setModal("create");
  };
  const openEdit = (c: Category) => {
    setSelected(c);
    setName(c.name);
    setParentId(c.parentId ? String(c.parentId) : "none");
    setModal("edit");
  };
  const openDelete = (c: Category) => {
    setSelected(c);
    setModal("delete");
  };
  const close = () => {
    setModal(null);
    setSelected(null);
    setName("");
    setParentId("none");
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: t.fieldRequired,
        description: t.categoryNameRequired,
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        parentId: parentId !== "none" ? parseInt(parentId) : undefined,
      };
      if (modal === "create") await createCategory(payload);
      else if (selected) await updateCategory(selected.id, payload);
      toast({
        title: modal === "create" ? t.categoryCreated : t.categoryUpdated,
        variant: "success",
      });
      await load();
      close();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast({
        title: t.genericError,
        description: msg ?? t.errorSaving,
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
      await deleteCategory(selected.id);
      toast({ title: t.categoryDeleted, variant: "success" });
      await load();
      close();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast({
        title: t.genericError,
        description: msg ?? t.errorDeleting,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Solo mostrar categorías principales como opciones de padre (no subcategorías)
  const parentOptions = categories.filter(
    (c) => !c.parentId && c.id !== selected?.id,
  );

  if (loading) return <Loader />;

  return (
    <div className="space-y-5">
      <Toaster toasts={toasts} dismiss={dismiss} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t.categoriesTotal(categories.length)}
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> {t.newCategory}
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  "#",
                  t.name,
                  t.subcategories,
                  t.parentCategory,
                  t.products,
                  t.created,
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
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    {t.noData}
                  </td>
                </tr>
              ) : (
                categories.map((c, idx) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-3.5 font-medium">
                      {c.parentId && (
                        <span className="text-muted-foreground mr-1">↳</span>
                      )}
                      {c.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge>
                        {c._count?.children ?? 0} {t.subcategories}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {c.parent ? (
                        <Badge variant="outline">{c.parent.name}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {t.principal}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge>
                        {c._count?.products ?? 0} {t.products}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(c)}
                        >
                          <Pencil className="h-3.5 w-3.5" /> {t.edit}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDelete(c)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> {t.delete}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modal === "create" ? t.newCategory : `${t.edit} ${t.categories}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{t.categoryName}</Label>
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.parentCategory}</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.principal}</SelectItem>
                  {parentOptions.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <DialogTitle>{t.deleteCategoryTitle}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t.deleteCategoryDesc(selected?.name ?? "")}
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
