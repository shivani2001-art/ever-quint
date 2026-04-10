import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Columns3, Signal, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useTaskStore } from '../../features/tasks/store';
import type { TaskStatus, TaskPriority } from '../../types/task';
import styles from './FilterBar.module.css';

const STATUSES: TaskStatus[] = ['Backlog', 'In Progress', 'Done'];

const SORT_OPTIONS = [
  { value: 'updatedAt-desc', label: 'Last updated' },
  { value: 'createdAt-desc', label: 'Newest first' },
  { value: 'createdAt-asc', label: 'Oldest first' },
  { value: 'priority-desc', label: 'Priority \u2193' },
  { value: 'priority-asc', label: 'Priority \u2191' },
];

function FilterBar() {
  const filters = useTaskStore((state) => state.filters);
  const setFilters = useTaskStore((state) => state.setFilters);

  const [searchInput, setSearchInput] = useState(filters.search);
  const [statusOpen, setStatusOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setFilters({ search: value });
      }, 300);
    },
    [setFilters],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    }
    if (statusOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [statusOpen]);

  const handleStatusToggle = (status: TaskStatus) => {
    const current = filters.status;
    const isSelected = current.includes(status);
    if (isSelected && current.length === 1) return;
    const next = isSelected
      ? current.filter((s) => s !== status)
      : [...current, status];
    setFilters({ status: next });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const priority: TaskPriority | null = value === '' ? null : (value as TaskPriority);
    setFilters({ priority });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const [sortField, sortDirection] = value.split('-') as [string, string];
    setFilters({
      sortField: sortField as typeof filters.sortField,
      sortDirection: sortDirection as typeof filters.sortDirection,
    });
  };

  const currentSortValue = `${filters.sortField}-${filters.sortDirection}`;
  const activeStatusCount = filters.status.length;

  return (
    <div className={styles.filterBar} role="region" aria-label="Task filters">
      {/* Search */}
      <div className={styles.searchBox}>
        <Search className={styles.searchIcon} size={13} aria-hidden="true" />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search tasks..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          aria-label="Search tasks"
        />
      </div>

      {/* Separator */}
      <div className={styles.separator} aria-hidden="true" />

      {/* Status Filter Dropdown */}
      <div className={styles.dropdown} ref={statusRef}>
        <button
          type="button"
          className={styles.dropdownTrigger}
          onClick={() => setStatusOpen(!statusOpen)}
          aria-expanded={statusOpen}
          aria-haspopup="true"
        >
          <Columns3 className={styles.filterIcon} size={13} aria-hidden="true" />
          <span className={styles.dropdownLabel}>Status</span>
          <span className={styles.badge}>{activeStatusCount}</span>
          <ChevronDown className={styles.chevron} size={12} aria-hidden="true" />
        </button>
        {statusOpen && (
          <div className={styles.dropdownMenu} role="group" aria-label="Status filter options">
            {STATUSES.map((status) => {
              const isSelected = filters.status.includes(status);
              return (
                <label key={status} className={styles.dropdownItem}>
                  <input
                    type="checkbox"
                    className={styles.dropdownCheckbox}
                    checked={isSelected}
                    onChange={() => handleStatusToggle(status)}
                  />
                  <span>{status}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Priority Filter */}
      <div className={styles.selectControl}>
        <Signal className={styles.filterIcon} size={13} aria-hidden="true" />
        <span className={styles.dropdownLabel}>{filters.priority ?? 'Priority'}</span>
        <ChevronDown className={styles.chevron} size={12} aria-hidden="true" />
        <select
          className={styles.filterSelect}
          value={filters.priority ?? ''}
          onChange={handlePriorityChange}
          aria-label="Filter by priority"
        >
          <option value="">Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Spacer */}
      <div className={styles.spacer} />

      {/* Sort Control */}
      <div className={styles.selectControl}>
        <ArrowUpDown className={styles.filterIcon} size={13} aria-hidden="true" />
        <span className={`${styles.dropdownLabel} ${styles.filterSelectMono}`}>
          {SORT_OPTIONS.find((o) => o.value === currentSortValue)?.label ?? 'Sort'}
        </span>
        <ChevronDown className={styles.chevron} size={12} aria-hidden="true" />
        <select
          className={`${styles.filterSelect} ${styles.filterSelectMono}`}
          value={currentSortValue}
          onChange={handleSortChange}
          aria-label="Sort tasks"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export { FilterBar };
