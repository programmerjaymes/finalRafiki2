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

interface WardOpt {
  id: string;
  name: string | null;
  code: string | null;
  districtId: string | null;
}

interface StreetRow {
  id: string;
  name: string;
  code: string | null;
  wardId: string;
  ward?: {
    name: string | null;
    code: string | null;
    districtId: string | null;
  };
}

export default function StreetList() {
  const [rows, setRows] = useState<StreetRow[]>([]);
  const [wards, setWards] = useState<WardOpt[]>([]);
  const [filterWard, setFilterWard] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const { isOpen: isAdd, openModal: openAdd, closeModal: closeAdd } = useModal();
  const { isOpen: isEdit, openModal: openEdit, closeModal: closeEdit } = useModal();
  const [current, setCurrent] = useState<StreetRow | null>(null);
  const [form, setForm] = useState({ name: '', code: '', wardId: '' });

  const loadWards = async () => {
    const res = await fetch('/api/admin/wards');
    if (res.ok) {
      const d = await res.json();
      setWards(Array.isArray(d) ? d : []);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const q = filterWard
        ? `?wardId=${encodeURIComponent(filterWard)}`
        : '';
      const res = await fetch(`/api/admin/streets${q}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to load streets');
      }
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
      setLoadError(null);
    } catch (e) {
      setLoadError(
        e instanceof Error
          ? e.message
          : 'Failed to load streets (ensure the streets table exists — see prisma/migrations/20260326120000_streets_table_manual)'
      );
      toast.crud('fetch', 'streets', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWards();
  }, []);

  useEffect(() => {
    load();
  }, [filterWard]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterWard]);

  const filtered = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.code || '').toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (currentPage > tp) setCurrentPage(tp);
  }, [filtered.length, currentPage, pageSize]);

  const resetForm = () => setForm({ name: '', code: '', wardId: '' });

  const handleDelete = async (row: StreetRow) => {
    const ok = await Swal.fire({
      title: 'Delete street?',
      text: row.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Delete',
    });
    if (!ok.isConfirmed) return;
    try {
      const res = await fetch(`/api/admin/streets/${row.id}`, {
        method: 'DELETE',
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Delete failed');
      await load();
      toast.crud('delete', 'street');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.wardId) {
      toast.error('Name and ward are required');
      return;
    }
    try {
      const res = await fetch('/api/admin/streets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim() || null,
          wardId: form.wardId,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Create failed');
      await load();
      closeAdd();
      resetForm();
      toast.crud('create', 'street');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Create failed');
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    if (!form.name.trim() || !form.wardId) {
      toast.error('Name and ward are required');
      return;
    }
    try {
      const res = await fetch(`/api/admin/streets/${current.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim() || null,
          wardId: form.wardId,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Update failed');
      await load();
      closeEdit();
      toast.crud('update', 'street');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const openEditRow = (r: StreetRow) => {
    setCurrent(r);
    setForm({
      name: r.name,
      code: r.code || '',
      wardId: r.wardId,
    });
    openEdit();
  };

  const wardSelect = (
    <select
      value={form.wardId}
      onChange={(e) => setForm((f) => ({ ...f, wardId: e.target.value }))}
      className="h-11 w-full rounded-lg border border-gray-300 px-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    >
      <option value="">Select ward</option>
      {wards.map((w) => (
        <option key={w.id} value={w.id}>
          {w.name || w.code || w.id}
        </option>
      ))}
    </select>
  );

  const columns: Column<StreetRow>[] = [
    {
      key: 'sn',
      header: 'S/N',
      cell: (_, i) => <span>{(currentPage - 1) * pageSize + i + 1}</span>,
    },
    {
      key: 'name',
      header: 'Street',
      cell: (r) => (
        <span className="font-medium text-gray-800 dark:text-white">
          {r.name}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'ward',
      header: 'Ward',
      cell: (r) => r.ward?.name || r.ward?.code || '—',
    },
    { key: 'code', header: 'Code', cell: (r) => r.code || '—' },
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
      <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-between flex-wrap">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative flex-1 min-w-[180px] max-w-md">
            <input
              placeholder="Search streets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 px-4 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <select
            value={filterWard}
            onChange={(e) => setFilterWard(e.target.value)}
            className="h-11 rounded-lg border border-gray-300 px-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white min-w-[220px]"
          >
            <option value="">All wards</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name || w.code || w.id}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="gap-1"
          onClick={() => {
            resetForm();
            openAdd();
          }}
        >
          <FiPlus className="h-4 w-4" /> Add street
        </Button>
      </div>
      {loadError && (
        <div className="mb-4 p-3 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-200 text-sm">
          {loadError}
        </div>
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
          <h4 className="text-lg font-semibold mb-4 dark:text-white">Add street</h4>
          <div className="space-y-3">
            <div>
              <Label>Ward *</Label>
              {wardSelect}
            </div>
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" size="sm" onClick={closeAdd}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEdit} onClose={closeEdit} className="max-w-md p-6">
        <form onSubmit={submitEdit}>
          <h4 className="text-lg font-semibold mb-4 dark:text-white">Edit street</h4>
          <div className="space-y-3">
            <div>
              <Label>Ward *</Label>
              {wardSelect}
            </div>
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" size="sm" onClick={closeEdit}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
