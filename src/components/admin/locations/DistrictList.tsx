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

interface RegionOpt {
  id: string;
  name: string | null;
  code: string | null;
}

interface DistrictRow {
  id: string;
  name: string | null;
  code: string | null;
  regionCode: string;
  regionId: string | null;
  tamisemiId: string;
  region?: { name: string | null; code: string | null };
}

export default function DistrictList() {
  const [rows, setRows] = useState<DistrictRow[]>([]);
  const [regions, setRegions] = useState<RegionOpt[]>([]);
  const [filterRegion, setFilterRegion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const { isOpen: isAdd, openModal: openAdd, closeModal: closeAdd } = useModal();
  const { isOpen: isEdit, openModal: openEdit, closeModal: closeEdit } = useModal();
  const [current, setCurrent] = useState<DistrictRow | null>(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    regionCode: '',
    regionId: '',
    tamisemiId: '',
  });

  const loadRegions = async () => {
    const res = await fetch('/api/admin/regions');
    if (res.ok) {
      const d = await res.json();
      setRegions(Array.isArray(d) ? d : []);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const q = filterRegion
        ? `?regionId=${encodeURIComponent(filterRegion)}`
        : '';
      const res = await fetch(`/api/admin/districts${q}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setError('Failed to load districts');
      toast.crud('fetch', 'districts', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegions();
  }, []);

  useEffect(() => {
    load();
  }, [filterRegion]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterRegion]);

  const filtered = rows.filter(
    (r) =>
      (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.code || '').toLowerCase().includes(search.toLowerCase()) ||
      r.regionCode.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (currentPage > tp) setCurrentPage(tp);
  }, [filtered.length, currentPage, pageSize]);

  const onRegionPick = (regionId: string) => {
    const r = regions.find((x) => x.id === regionId);
    setForm((f) => ({
      ...f,
      regionId,
      regionCode: r?.code || r?.name || f.regionCode,
    }));
  };

  const resetForm = () =>
    setForm({
      name: '',
      code: '',
      regionCode: '',
      regionId: '',
      tamisemiId: '',
    });

  const handleDelete = async (row: DistrictRow) => {
    const ok = await Swal.fire({
      title: 'Delete district?',
      text: row.name || row.id,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Delete',
    });
    if (!ok.isConfirmed) return;
    try {
      const res = await fetch(`/api/admin/districts/${row.id}`, {
        method: 'DELETE',
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Delete failed');
      await load();
      toast.crud('delete', 'district');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.regionId || !form.tamisemiId.trim()) {
      toast.error('Name, region, and TAMISEMI id are required');
      return;
    }
    if (!form.regionCode.trim()) {
      toast.error('Region code is required (set automatically when you pick a region, or type it)');
      return;
    }
    try {
      const res = await fetch('/api/admin/districts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim() || null,
          regionCode: form.regionCode.trim(),
          regionId: form.regionId,
          tamisemiId: form.tamisemiId.trim(),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Create failed');
      await load();
      closeAdd();
      resetForm();
      toast.crud('create', 'district');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Create failed');
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    if (!form.name.trim() || !form.regionId || !form.tamisemiId.trim()) {
      toast.error('Name, region, and TAMISEMI id are required');
      return;
    }
    if (!form.regionCode.trim()) {
      toast.error('Region code is required');
      return;
    }
    try {
      const res = await fetch(`/api/admin/districts/${current.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim() || null,
          regionCode: form.regionCode.trim(),
          regionId: form.regionId,
          tamisemiId: form.tamisemiId.trim(),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Update failed');
      await load();
      closeEdit();
      toast.crud('update', 'district');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const openEditRow = (r: DistrictRow) => {
    setCurrent(r);
    setForm({
      name: r.name || '',
      code: r.code || '',
      regionCode: r.regionCode || '',
      regionId: r.regionId || '',
      tamisemiId: String(r.tamisemiId),
    });
    openEdit();
  };

  const columns: Column<DistrictRow>[] = [
    {
      key: 'sn',
      header: 'S/N',
      cell: (_, i) => <span>{(currentPage - 1) * pageSize + i + 1}</span>,
    },
    {
      key: 'name',
      header: 'District',
      cell: (r) => (
        <span className="font-medium text-gray-800 dark:text-white">
          {r.name || '—'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'region',
      header: 'Region',
      cell: (r) => r.region?.name || r.region?.code || '—',
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

  const regionSelect = (
    <select
      value={form.regionId}
      onChange={(e) => onRegionPick(e.target.value)}
      className="h-11 w-full rounded-lg border border-gray-300 px-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    >
      <option value="">Select region</option>
      {regions.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name || r.code || r.id}
        </option>
      ))}
    </select>
  );

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-between flex-wrap">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative flex-1 min-w-[180px] max-w-md">
            <input
              placeholder="Search districts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 px-4 pr-10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="h-11 rounded-lg border border-gray-300 px-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white min-w-[200px]"
          >
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name || r.code || r.id}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="gap-1 shrink-0"
          onClick={() => {
            resetForm();
            openAdd();
          }}
        >
          <FiPlus className="h-4 w-4" /> Add district
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
          <h4 className="text-lg font-semibold mb-4 dark:text-white">
            Add district
          </h4>
          <div className="space-y-3">
            <div>
              <Label>Region *</Label>
              {regionSelect}
            </div>
            <div>
              <Label>Region code *</Label>
              <Input
                value={form.regionCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, regionCode: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>District code</Label>
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
          <h4 className="text-lg font-semibold mb-4 dark:text-white">
            Edit district
          </h4>
          <div className="space-y-3">
            <div>
              <Label>Region *</Label>
              {regionSelect}
            </div>
            <div>
              <Label>Region code *</Label>
              <Input
                value={form.regionCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, regionCode: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>District code</Label>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeEdit}
            >
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
