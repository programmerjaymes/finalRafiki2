'use client';

import { useState, useEffect } from 'react';
import { SearchableSelect, SearchableSelectTrigger, SearchableSelectValue, SearchableSelectContent, SearchableSelectItem } from '@/components/ui/searchable-select';
import { motion } from 'framer-motion';
import { Category, Region } from '@prisma/client';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';

type AreaOption = { id: string; name: string | null };

export default function BusinessSearch() {
  const locale = useLocale();
  const messages = t(locale);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<AreaOption[]>([]);
  const [wards, setWards] = useState<AreaOption[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [regionSearch, setRegionSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [wardSearch, setWardSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const safeArray = <T,>(value: unknown, fallback: T[] = []): T[] => {
      if (Array.isArray(value)) return value as T[];
      if (value && typeof value === 'object') {
        const maybeArray = (value as Record<string, unknown>).data ?? (value as Record<string, unknown>).regions;
        if (Array.isArray(maybeArray)) return maybeArray as T[];
      }
      return fallback;
    };

    const load = async () => {
      try {
        const [categoriesRes, regionsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/regions'),
        ]);

        const [categoriesJson, regionsJson] = await Promise.all([
          categoriesRes.json().catch(() => null),
          regionsRes.json().catch(() => null),
        ]);

        if (!cancelled) {
          setCategories(categoriesRes.ok ? safeArray<Category>(categoriesJson) : []);
          setRegions(regionsRes.ok ? safeArray<Region>(regionsJson) : []);
          setIsLoaded(true);
        }
      } catch (err) {
        console.error('Error fetching search filters:', err);
        if (!cancelled) {
          setCategories([]);
          setRegions([]);
          setIsLoaded(true);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedRegion) {
      setDistricts([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/districts?regionId=${encodeURIComponent(selectedRegion)}`);
        if (!r.ok) throw new Error('districts');
        const data: unknown = await r.json();
        if (!cancelled && Array.isArray(data)) {
          setDistricts(
            data.map((d: { id?: string; name?: string | null }) => ({
              id: String(d.id),
              name: d.name ?? null,
            })),
          );
        }
      } catch {
        if (!cancelled) setDistricts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedRegion]);

  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/wards?districtId=${encodeURIComponent(selectedDistrict)}`);
        if (!r.ok) throw new Error('wards');
        const data: unknown = await r.json();
        if (!cancelled && Array.isArray(data)) {
          setWards(
            data.map((w: { id?: string; name?: string | null }) => ({
              id: String(w.id),
              name: w.name ?? null,
            })),
          );
        }
      } catch {
        if (!cancelled) setWards([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDistrict]);

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (selectedCategory) searchParams.append('category', selectedCategory);
    if (selectedRegion) searchParams.append('region', selectedRegion);
    if (selectedDistrict) searchParams.append('district', selectedDistrict);
    if (selectedWard) searchParams.append('ward', selectedWard);
    if (priceRange) searchParams.append('priceRange', priceRange);

    window.location.href = `/search?${searchParams.toString()}`;
  };

  const selectClass =
    'w-full py-2 pl-3 pr-9 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary dark:focus:border-secondary focus:ring-2 focus:ring-primary/15 dark:focus:ring-secondary/15 transition duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white';

  const chevron = (
    <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400 dark:text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
      </svg>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 8 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-3 lg:items-end">
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {messages.search.category}
          </label>
          <SearchableSelect
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SearchableSelectTrigger className={selectClass}>
              <SearchableSelectValue placeholder={messages.search.allCategories} />
            </SearchableSelectTrigger>
            <SearchableSelectContent
              searchPlaceholder="Search categories..."
              searchValue={categorySearch}
              onSearchChange={setCategorySearch}
            >
              <SearchableSelectItem value="">{messages.search.allCategories}</SearchableSelectItem>
              {categories
                .filter((category) => 
                  category.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                  category.nameEn?.toLowerCase().includes(categorySearch.toLowerCase()) ||
                  category.nameSw?.toLowerCase().includes(categorySearch.toLowerCase())
                )
                .map((category) => (
                  <SearchableSelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SearchableSelectItem>
                ))}
            </SearchableSelectContent>
          </SearchableSelect>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {messages.search.mkoa}
          </label>
          <SearchableSelect
            value={selectedRegion}
            onValueChange={(value) => {
              setSelectedRegion(value);
              setSelectedDistrict('');
              setSelectedWard('');
              setDistrictSearch('');
              setWardSearch('');
            }}
          >
            <SearchableSelectTrigger className={selectClass}>
              <SearchableSelectValue placeholder={messages.search.allLocations} />
            </SearchableSelectTrigger>
            <SearchableSelectContent
              searchPlaceholder="Search regions..."
              searchValue={regionSearch}
              onSearchChange={setRegionSearch}
            >
              <SearchableSelectItem value="">{messages.search.allLocations}</SearchableSelectItem>
              {regions
                .filter((region) => 
                  region.name?.toLowerCase().includes(regionSearch.toLowerCase()) ||
                  region.code?.toLowerCase().includes(regionSearch.toLowerCase())
                )
                .map((region) => (
                  <SearchableSelectItem key={String(region.id)} value={String(region.id)}>
                    {region.name}
                  </SearchableSelectItem>
                ))}
            </SearchableSelectContent>
          </SearchableSelect>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {messages.search.wilaya}
          </label>
          <SearchableSelect
            value={selectedDistrict}
            onValueChange={(value) => {
              setSelectedDistrict(value);
              setSelectedWard('');
              setWardSearch('');
            }}
            disabled={!selectedRegion}
          >
            <SearchableSelectTrigger className={selectClass}>
              <SearchableSelectValue placeholder={!selectedRegion ? messages.search.pickMkoaFirst : messages.search.allWilaya} />
            </SearchableSelectTrigger>
            <SearchableSelectContent
              searchPlaceholder="Search districts..."
              searchValue={districtSearch}
              onSearchChange={setDistrictSearch}
            >
              <SearchableSelectItem value="">{messages.search.allWilaya}</SearchableSelectItem>
              {districts
                .filter((d) => 
                  d.name?.toLowerCase().includes(districtSearch.toLowerCase()) ||
                  d.id.toLowerCase().includes(districtSearch.toLowerCase())
                )
                .map((d) => (
                  <SearchableSelectItem key={d.id} value={d.id}>
                    {d.name || d.id}
                  </SearchableSelectItem>
                ))}
            </SearchableSelectContent>
          </SearchableSelect>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {messages.search.kijiji}
          </label>
          <SearchableSelect
            value={selectedWard}
            onValueChange={setSelectedWard}
            disabled={!selectedDistrict}
          >
            <SearchableSelectTrigger className={selectClass}>
              <SearchableSelectValue placeholder={!selectedDistrict ? messages.search.pickWilayaFirst : messages.search.allKijiji} />
            </SearchableSelectTrigger>
            <SearchableSelectContent
              searchPlaceholder="Search wards..."
              searchValue={wardSearch}
              onSearchChange={setWardSearch}
            >
              <SearchableSelectItem value="">{messages.search.allKijiji}</SearchableSelectItem>
              {wards
                .filter((w) => 
                  w.name?.toLowerCase().includes(wardSearch.toLowerCase()) ||
                  w.id.toLowerCase().includes(wardSearch.toLowerCase())
                )
                .map((w) => (
                  <SearchableSelectItem key={w.id} value={w.id}>
                    {w.name || w.id}
                  </SearchableSelectItem>
                ))}
            </SearchableSelectContent>
          </SearchableSelect>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {messages.search.priceRange}
          </label>
          <SearchableSelect
            value={priceRange}
            onValueChange={setPriceRange}
          >
            <SearchableSelectTrigger className={selectClass}>
              <SearchableSelectValue placeholder={messages.search.anyPrice} />
            </SearchableSelectTrigger>
            <SearchableSelectContent>
              <SearchableSelectItem value="">{messages.search.anyPrice}</SearchableSelectItem>
              <SearchableSelectItem value="low">{messages.search.budget}</SearchableSelectItem>
              <SearchableSelectItem value="medium">{messages.search.standard}</SearchableSelectItem>
              <SearchableSelectItem value="high">{messages.search.premium}</SearchableSelectItem>
            </SearchableSelectContent>
          </SearchableSelect>
        </div>

        <div className="sm:col-span-2 lg:col-span-2 flex items-end">
          <button
            type="button"
            onClick={handleSearch}
            className="w-full bg-primary text-white dark:bg-secondary dark:text-gray-900 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-dark dark:hover:bg-secondary-light transition duration-200 inline-flex items-center justify-center gap-2 shadow-sm hover:shadow"
          >
            <span>{messages.search.submitSearch}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {messages.search.popularSearches}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {messages.home.popularSearchTags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-transparent hover:border-primary/20 dark:hover:border-secondary/30 transition"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
