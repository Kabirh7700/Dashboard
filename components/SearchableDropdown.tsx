
import React, { useState, useRef, useEffect } from 'react';
import { ChevronUpDownIcon } from './Icons.tsx';

interface Item {
    value: string;
    label: string;
}

interface SearchableDropdownProps {
    items: Item[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({ items, value, onChange, placeholder = "Select an option" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredItems = query === ''
        ? items
        : items.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));

    const selectedItem = items.find(item => item.value === value);

    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue);
        setQuery('');
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative w-full">
            <button
                type="button"
                className="relative w-full cursor-default rounded-lg bg-white py-2.5 pl-3 pr-10 text-left border border-slate-300 shadow-sm focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="block truncate text-base">{selectedItem ? selectedItem.label : placeholder}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                    <div className="p-2">
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Search..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                        {filteredItems.length === 0 && query !== '' ? (
                            <li className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                Nothing found.
                            </li>
                        ) : (
                            filteredItems.map(item => (
                                <li
                                    key={item.value}
                                    className={`relative cursor-default select-none py-2 px-4 text-gray-900 hover:bg-blue-100 ${value === item.value ? 'bg-blue-100 font-bold' : ''}`}
                                    onClick={() => handleSelect(item.value)}
                                >
                                    {item.label}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};
