import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatches } from '../../api/eventos';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function MatchCatalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState(null);
  const [minPrice, setMinPrice] = useState(5);
  const [maxPrice, setMaxPrice] = useState(150);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const gridRef = useRef(null);

  useEffect(() => {
    getMatches()
      .then(setMatches)
      .catch((err) => setError(err.message || 'No se pudieron cargar los eventos'))
      .finally(() => setLoading(false));
  }, []);

  const filteredMatches = matches.filter(match => {
    const matchDate = new Date(match.date);

    if (searchTerm && !match.title.toLowerCase().includes(searchTerm.toLowerCase()) && !match.stadium.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    if (filterDate) {
      if (matchDate.toDateString() !== filterDate.toDateString()) {
        return false;
      }
    }

    if (minPrice !== null && match.priceBase < minPrice) {
      return false;
    }

    if (maxPrice !== null && match.priceBase > maxPrice) {
      return false;
    }

    return true;
  });

  const gridItem = (match) => (
    <div className="col-12 md:col-6 lg:col-4" key={match.id}>
      <div
        className="h-full flex flex-column surface-card border-round-2xl overflow-hidden shadow-2 hover:shadow-6 transition-all transition-duration-200 cursor-pointer border-1 border-100"
        onClick={() => navigate(`/match/${match.id}/stadium`)}
      >
        <div className="relative w-full" style={{ aspectRatio: '4 / 3', backgroundColor: 'var(--surface-100)' }}>
          <img src={match.imageUrl} alt={match.title} className="w-full h-full object-cover" />
          <span
            className="absolute top-0 right-0 m-2 px-2 py-1 border-round-lg text-xs font-bold shadow-1"
            style={{ backgroundColor: 'var(--tg-green)', color: 'var(--tg-ink)' }}
          >
            Disponible
          </span>
        </div>

        <div className="flex flex-column gap-3 p-3 flex-1">
          <h3
            className="text-lg font-bold text-color m-0"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.8rem' }}
          >
            {match.title}
          </h3>

          <div className="flex align-items-center justify-content-between">
            <span className="text-sm text-color-secondary flex align-items-center gap-2">
              <i className="pi pi-calendar text-primary"></i>
              {new Date(match.date).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="flex align-items-center justify-content-center border-circle border-none cursor-pointer flex-shrink-0"
              style={{ width: '2.25rem', height: '2.25rem', backgroundColor: 'var(--surface-100)' }}
              aria-label="Compartir evento"
            >
              <i className="pi pi-share-alt text-color-secondary"></i>
            </button>
          </div>

          <span className="text-sm text-color-secondary flex align-items-center gap-2">
            <i className="pi pi-map-marker text-primary"></i>
            {match.stadium}
          </span>

          <div className="flex align-items-center justify-content-between mt-auto pt-3 border-top-1 surface-border">
            <div>
              <span className="block text-xs text-color-secondary">Desde</span>
              <span className="text-xl font-bold text-color">${match.priceBase.toFixed(2)}</span>
            </div>
            <Button
              label="Reservar"
              className="p-button-sm p-button-rounded"
              onClick={(e) => { e.stopPropagation(); navigate(`/match/${match.id}/stadium`); }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const listTemplate = (items) => {
    if (!items || items.length === 0) {
      return (
        <div className="col-12 p-5 text-center">
          <i className="pi pi-search text-6xl text-color-secondary mb-3"></i>
          <h3 className="text-xl font-bold text-color mb-2">Sin resultados</h3>
          <p className="text-color-secondary">No se encontraron eventos que coincidan con tus filtros.</p>
          <Button label="Limpiar filtros" className="p-button-text p-button-primary mt-3" onClick={() => {
            setSearchTerm('');
            setFilterDate(null);
            setMinPrice(5);
            setMaxPrice(150);
          }} />
        </div>
      );
    }

    return <div className="grid">{items.map((item) => gridItem(item))}</div>;
  };

  return (
    <div className="flex flex-column gap-5">
      {/* Hero */}
      <div className="relative animated-lines-bg border-round-3xl overflow-hidden flex align-items-center justify-content-center text-center px-4" style={{ minHeight: '300px' }}>
        <div className="relative z-1 py-5">
          <span
            className="inline-block px-3 py-1 border-round-lg text-xs font-bold mb-3"
            style={{ backgroundColor: 'rgba(106,197,47,0.14)', color: 'var(--tg-green)', letterSpacing: '0.05em' }}
          >
            PARA SUPER FANS
          </span>
          <h1 className="text-5xl font-bold m-0 mb-3" style={{ color: '#f5f7f5' }}>Vive la pasión en vivo</h1>
          <p className="text-lg m-0 mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Encuentra tu próximo partido, concierto o evento favorito.
          </p>
          <Button
            label="Ver Eventos"
            icon="pi pi-arrow-down"
            iconPos="right"
            className="p-button-rounded shadow-2"
            onClick={() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="solid-bg-white p-3 border-round-3xl shadow-2 border-1 border-200">
        <div className="flex flex-column lg:flex-row gap-3 align-items-end">
          <div className="flex flex-column gap-2 flex-1 w-full">
            <label className="text-xs font-medium text-color-secondary">Búsqueda</label>
            <IconField iconPosition="left" className="w-full">
              <InputIcon className="pi pi-search" />
              <InputText value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Equipo o estadio..." className="w-full" />
            </IconField>
          </div>

          <div className="flex flex-column gap-2 w-full lg:w-15rem">
            <label className="text-xs font-medium text-color-secondary">Fecha</label>
            <IconField iconPosition="left" className="w-full">
              <InputIcon className="pi pi-calendar z-2" />
              <Calendar value={filterDate} onChange={(e) => setFilterDate(e.value)} placeholder="Cualquier fecha" className="w-full" inputClassName="pl-5 w-full" />
            </IconField>
          </div>

          <div className="flex gap-2 w-full lg:w-20rem">
            <div className="flex-1">
              <label className="text-xs font-medium text-color-secondary block mb-2">Desde ($)</label>
              <InputText type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value) || 0)} className="w-full" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-color-secondary block mb-2">Hasta ($)</label>
              <InputText type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value) || 0)} className="w-full" />
            </div>
          </div>

          <Button
            icon="pi pi-times"
            className="p-button-outlined p-button-secondary flex-shrink-0"
            onClick={() => {
              setSearchTerm('');
              setFilterDate(null);
              setMinPrice(0);
              setMaxPrice(150);
            }}
          />
        </div>
      </div>

      {/* Grid de eventos */}
      <div ref={gridRef}>
        <div className="flex justify-content-between align-items-center mb-3">
          <span className="text-color-secondary font-medium">Mostrando {filteredMatches.length} eventos</span>
        </div>

        {loading ? (
          <div className="flex justify-content-center p-6">
            <ProgressSpinner style={{ width: '3rem', height: '3rem' }} />
          </div>
        ) : error ? (
          <div className="p-5 text-center text-red-500">{error}</div>
        ) : (
          <DataView value={filteredMatches} listTemplate={listTemplate} paginator rows={6} />
        )}
      </div>
    </div>
  );
}
