'use client';

import React, { useState, useEffect } from 'react';
import { FiEdit, FiPlus, FiSearch } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import DataTable, { Column } from '@/components/tables/DataTable';
import toast from '@/utils/toast';
import Swal from 'sweetalert2';

interface RegionRow {
  id: string;
  name: string | null;
  code: string | null;
  tamisemiId: string;
}

export default function RegionList() {
  const [rows, setRows] = useState<RegionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const { isOpen: isAdd, openModal: openAdd, closeModal: closeAdd } = useModal();
  const { isOpen: isEdit, openModal: openEdit, closeModal: closeEdit } = useModal();
  const [current, setCurrent] = useState<RegionRow | null>(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    tamisemiId: '',
  });

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/regions');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setError('Failed to load regions');
      toast.crud('fetch', 'regions', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = rows.filter(
    (r) =>
      (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.code || '').toLowerCase().includes(search.toLowerCase()) ||
      String(r.tamisemiId).includes(search)
  );

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filtered.length, currentPage, pageSize]);

  const resetForm = () =>
    setForm({ name: '', code: '', tamisemiId: '' });

  const handleDelete = async (r: RegionRow) => {
    const ok = await Swal.fire({
      title: 'Delete region?',
      text: r.name || r.id,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#ef4444',
    });
    if (!ok.isConfirmed) return;
    try {
      const res = await fetch(`/api/admin/regions/${r.id}`, { method: 'DELETE' });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Delete failed');
      await load();
      toast.crud('delete', 'region');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.tamisemiId.trim()) {
      toast.error('Name and TAMISEMI id are required');
      return;
    }
    try {
      const res = await fetch('/api/admin/regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim() || null,
          tamisemiId: form.tamisemiId.trim(),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Create failed');
      await load();
      closeAdd();
      resetForm();
      toast.crud('create', 'region');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Create failed');
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    if (!form.name.trim() || !form.tamisemiId.trim()) {
      toast.error('Name and TAMISEMI id are required');
      return;
    }
    try {
      const res = await fetch(`/api/admin/regions/${current.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim() || null,
          tamisemiId: form.tamisemiId.trim(),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Update failed');
      await load();
      closeEdit();
      toast.crud('update', 'region');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const openEditRow = (r: RegionRow) => {
    setCurrent(r);
    setForm({
      name: r.name || '',
      code: r.code || '',
      tamisemiId: String(r.tamisemiId),
    });
    openEdit();
  };

  const columns: Column<RegionRow>[] = [
    {
      key: 'sn',
      header: 'S/N',
      cell: (_, i) => (
        <span>{(currentPage - 1) * pageSize + i + 1}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      cell: (r) => (
        <span className="font-medium text-gray-800 dark:text-white">
          {r.name || '—'}
        </span>
      ),
      sortable: true,
    },
    { key: 'code', header: 'Code', cell: (r) => r.code || '—', sortable: true },
    {
      key: 'tam',
      header: 'TAMISEMI',
      cell: (r) => String(r.tamisemiId),
      sortable: true,
    },
    {
      key: 'act',
      header: 'Actions',
      cell: (r) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-primary-500"
            onClick={(e) => {
              e.stopPropagation();
              openEditRow(r);
            }}
          >
            <FiEdit className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-error-500"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(r);
            }}
          >
            <RiDeleteBin6Line className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <input
            placeholder="Search regions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 px-4 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <Button variant="primary" size="sm" className="gap-1" onClick={() => { resetForm(); openAdd(); }}>
          <FiPlus className="h-4 w-4" /> Add region
        </Button>
      </div>
      {error && (
        <div className="mb-4 p-3 rounded-md bg-error-500/10 text-error-600">{error}</div>
      )}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin h-10 w-10 border-2 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          keyExtractor={(r) => r.id}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRowClick={openEditRow}
        />
      )}

      <Modal isOpen={isAdd} onClose={closeAdd} className="max-w-md p-6">
        <form onSubmit={submitAdd}>
          <h4 className="text-lg font-semibold mb-4 dark:text-white">Add region</h4>
          <div className="space-y-3">
            <div>
              <Label>Name *</Label>
              <Input name="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Code</Label>
              <Input name="code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <Label>TAMISEMI id *</Label>
              <Input name="tamisemiId" value={form.tamisemiId} onChange={(e) => setForm((f) => ({ ...f, tamisemiId: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" size="sm" onClick={closeAdd}>Cancel</Button>
            <Button type="submit" size="sm">Save</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEdit} onClose={closeEdit} className="max-w-md p-6">
        <form onSubmit={submitEdit}>
          <h4 className="text-lg font-semibold mb-4 dark:text-white">Edit region</h4>
          <div className="space-y-3">
            <div>
              <Label>Name *</Label>
              <Input name="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Code</Label>
              <Input name="code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <Label>TAMISEMI id *</Label>
              <Input name="tamisemiId" value={form.tamisemiId} onChange={(e) => setForm((f) => ({ ...f, tamisemiId: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" size="sm" onClick={closeEdit}>Cancel</Button>
            <Button type="submit" size="sm">Update</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
