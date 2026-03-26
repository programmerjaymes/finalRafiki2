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

interface DistrictOpt {
  id: string;
  name: string | null;
  code: string | null;
  regionId: string | null;
}

interface WardRow {
  id: string;
  name: string | null;
  code: string | null;
  districtId: string | null;
  tamisemiId: string;
  district?: {
    name: string | null;
    code: string | null;
    regionId: string | null;
  };
}

export default function WardList() {
  const [rows, setRows] = useState<WardRow[]>([]);
  const [districts, setDistricts] = useState<DistrictOpt[]>([]);
  const [filterDistrict, setFilterDistrict] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const { isOpen: isAdd, openModal: openAdd, closeModal: closeAdd } = useModal();
  const { isOpen: isEdit, openModal: openEdit, closeModal: closeEdit } = useModal();
  const [current, setCurrent] = useState<WardRow | null>(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    districtId: '',
    tamisemiId: '',
  });

  const loadDistricts = async () => {
    const res = await fetch('/api/admin/districts');
    if (res.ok) {
      const d = await res.json();
      setDistricts(Array.isArray(d) ? d : []);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const q = filterDistrict
        ? `?districtId=${encodeURIComponent(filterDistrict)}`
        : '';
      const res = await fetch(`/api/admin/wards${q}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setError('Failed to load wards');
      toast.crud('fetch', 'wards', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    load();
  }, [filterDistrict]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDistrict]);

  const filtered = rows.filter(
    (r) =>
      (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.code || '').toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (currentPage > tp) setCurrentPage(tp);
  }, [filtered.length, currentPage, pageSize]);

  const resetForm = () =>
    setForm({ name: '', code: '', districtId: '', tamisemiId: '' });

  const handleDelete = async (row: WardRow) => {
    const ok = await Swal.fire({
      title: 'Delete ward?',
      text: row.name || row.id,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Delete',
    });
    if (!ok.isConfirmed) return;
    try {
      const res = await fetch(`/api/admin/wards/${row.id}`, { method: 'DELETE' });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Delete failed');
      await load();
      toast.crud('delete', 'ward');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.districtId || !form.tamisemiId.trim()) {
      toast.error('Name, district, and TAMISEMI id are required');
      return;
    }
    try {
      const res = await fetch('/api/admin/wards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim() || null,
          districtId: form.districtId,
          tamisemiId: form.tamisemiId.trim(),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Create failed');
      await load();
      closeAdd();
      resetForm();
      toast.crud('create', 'ward');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Create failed');
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    if (!form.name.trim() || !form.districtId || !form.tamisemiId.trim()) {
      toast.error('Name, district, and TAMISEMI id are required');
      return;
    }
    try {
      const res = await fetch(`/api/admin/wards/${current.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim() || null,
          districtId: form.districtId,
          tamisemiId: form.tamisemiId.trim(),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Update failed');
      await load();
      closeEdit();
      toast.crud('update', 'ward');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const openEditRow = (r: WardRow) => {
    setCurrent(r);
    setForm({
      name: r.name || '',
      code: r.code || '',
      districtId: r.districtId || '',
      tamisemiId: String(r.tamisemiId),
    });
    openEdit();
  };

  const districtSelect = (
    <select
      value={form.districtId}
      onChange={(e) =>
        setForm((f) => ({ ...f, districtId: e.target.value }))
      }
      className="h-11 w-full rounded-lg border border-gray-300 px-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    >
      <option value="">Select district</option>
      {districts.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name || d.code || d.id}
        </option>
      ))}
    </select>
  );

  const columns: Column<WardRow>[] = [
    {
      key: 'sn',
      header: 'S/N',
      cell: (_, i) => <span>{(currentPage - 1) * pageSize + i + 1}</span>,
    },
    {
      key: 'name',
      header: 'Ward',
      cell: (r) => (
        <span className="font-medium text-gray-800 dark:text-white">
          {r.name || '—'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'dist',
      header: 'District',
      cell: (r) => r.district?.name || r.district?.code || '—',
    },
    { key: 'code', header: 'Code', cell: (r) => r.code || '—' },
    {
      key: 'tam',
      header: 'TAMISEMI',
      cell: (r) => String(r.tamisemiId),
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
      <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-between flex-wrap">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative flex-1 min-w-[180px] max-w-md">
            <input
              placeholder="Search wards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 px-4 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="h-11 rounded-lg border border-gray-300 px-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white min-w-[220px]"
          >
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name || d.code || d.id}
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
          <FiPlus className="h-4 w-4" /> Add ward
        </Button>
      </div>
      {error && (
        <div className="mb-4 p-3 rounded-md bg-error-500/10 text-error-600">
          {error}
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
          <h4 className="text-lg font-semibold mb-4 dark:text-white">Add ward</h4>
          <div className="space-y-3">
            <div>
              <Label>District *</Label>
              {districtSelect}
            </div>
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Ward code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              />
            </div>
            <div>
              <Label>TAMISEMI id *</Label>
              <Input
                value={form.tamisemiId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tamisemiId: e.target.value }))
                }
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
          <h4 className="text-lg font-semibold mb-4 dark:text-white">Edit ward</h4>
          <div className="space-y-3">
            <div>
              <Label>District *</Label>
              {districtSelect}
            </div>
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Ward code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              />
            </div>
            <div>
              <Label>TAMISEMI id *</Label>
              <Input
                value={form.tamisemiId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tamisemiId: e.target.value }))
                }
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
