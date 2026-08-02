import React, { useState, useEffect, useMemo } from 'react';
import { getMatches } from '../../api/eventos';
import { abrirReporteGeneral } from '../../api/reservas';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressBar } from 'primereact/progressbar';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function Reports() {
  const [selectedMatch, setSelectedMatch] = useState('all');
  const [filterDate, setFilterDate] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generandoPdf, setGenerandoPdf] = useState(false);

  useEffect(() => {
    getMatches()
      .then(setMatches)
      .catch((err) => setError(err.message || 'No se pudieron cargar los partidos'))
      .finally(() => setLoading(false));
  }, []);

  // El backend no expone un endpoint de reportes/agregación todavía:
  // los partidos son reales, pero ventas/ingresos/ocupación siguen simulados.
  const reportData = useMemo(() => matches.map(m => {
    const sold = Math.floor(Math.random() * 5000 + 1000);
    const revenue = Math.random() * 100000 + 20000;
    const occupancy = Math.random() * 60 + 40;

    return {
      ...m,
      sold,
      revenue,
      occupancy
    };
  }), [matches]);

  const handleExportarPdf = async () => {
    setGenerandoPdf(true);
    try {
      const fecha = filterDate
        ? `${filterDate.getFullYear()}-${String(filterDate.getMonth() + 1).padStart(2, '0')}-${String(filterDate.getDate()).padStart(2, '0')}`
        : undefined;
      await abrirReporteGeneral({
        eventoId: selectedMatch,
        fechaInicio: fecha,
        fechaFin: fecha,
      });
    } catch (err) {
      setError(err.message || 'No se pudo generar el reporte en PDF');
    } finally {
      setGenerandoPdf(false);
    }
  };

  const matchOptions = [
    { label: 'Todos los partidos', value: 'all' },
    ...matches.map(m => ({ label: m.title, value: m.id }))
  ];

  const dateTemplate = (rowData) => {
    return new Date(rowData.date).toLocaleDateString('es-EC');
  };

  const revenueTemplate = (rowData) => {
    return <span className="font-bold text-green-500">${rowData.revenue.toFixed(2)}</span>;
  };

  const occupancyTemplate = (rowData) => {
    return (
      <span className="text-sm font-bold text-color">{rowData.occupancy.toFixed(1)}%</span>
    );
  };

  const footer = (
    <div className="flex justify-content-between align-items-center py-2">
      <span className="font-bold text-color">Totales Consolidados:</span>
      <div className="flex gap-5">
        <span className="font-bold text-green-500">$345,678.90</span>
        <span className="font-bold text-primary">85.4% Promedio</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-column gap-5">
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-color m-0">Reporte Consolidado</h1>
          <p className="text-color-secondary mt-1">Análisis de ventas e ingresos por evento.</p>
        </div>
        <Button
          label="Exportar PDF"
          icon="pi pi-file-pdf"
          className="p-button-danger shadow-3"
          loading={generandoPdf}
          onClick={handleExportarPdf}
        />
      </div>

      <div className="grid">
        <div className="col-12 md:col-4 p-3">
          <div className="solid-bg-white border-round-3xl shadow-4 p-5 flex flex-column justify-content-between h-full border-1 border-200 transition-transform hover:-translate-y-1">
            <div className="flex justify-content-between align-items-start mb-4">
               <div>
                 <span className="text-xs font-bold text-color-secondary uppercase tracking-widest block mb-1">Ingresos Totales</span>
                 <span className="text-3xl font-bold text-color">$345,678.90</span>
               </div>
               <div className="w-3rem h-3rem border-circle flex align-items-center justify-content-center shadow-2" style={{ backgroundColor: '#22c55e', color: 'white' }}>
                  <i className="pi pi-money-bill text-xl"></i>
               </div>
            </div>
            <span className="text-sm text-green-600 font-bold"><i className="pi pi-arrow-up text-xs mr-1"></i>+12.5% este mes</span>
          </div>
        </div>

        <div className="col-12 md:col-4 p-3">
          <div className="solid-bg-white border-round-3xl shadow-4 p-5 flex flex-column justify-content-between h-full border-1 border-200 transition-transform hover:-translate-y-1">
            <div className="flex justify-content-between align-items-start mb-4">
               <div>
                 <span className="text-xs font-bold text-color-secondary uppercase tracking-widest block mb-1">Boletos Vendidos</span>
                 <span className="text-3xl font-bold text-color">45,210</span>
               </div>
               <div className="w-3rem h-3rem border-circle flex align-items-center justify-content-center shadow-2" style={{ backgroundColor: '#3b82f6', color: 'white' }}>
                  <i className="pi pi-ticket text-xl"></i>
               </div>
            </div>
            <span className="text-sm text-blue-600 font-bold"><i className="pi pi-arrow-up text-xs mr-1"></i>+8.2% este mes</span>
          </div>
        </div>

        <div className="col-12 md:col-4 p-3">
          <div className="solid-bg-white border-round-3xl shadow-4 p-5 flex flex-column justify-content-between h-full border-1 border-200 transition-transform hover:-translate-y-1">
            <div className="flex justify-content-between align-items-start mb-4">
               <div>
                 <span className="text-xs font-bold text-color-secondary uppercase tracking-widest block mb-1">Ocupación Promedio</span>
                 <span className="text-3xl font-bold text-color">85.4%</span>
               </div>
               <div className="w-3rem h-3rem border-circle flex align-items-center justify-content-center shadow-2" style={{ backgroundColor: '#f97316', color: 'white' }}>
                  <i className="pi pi-users text-xl"></i>
               </div>
            </div>
            <span className="text-sm text-orange-600 font-bold"><i className="pi pi-minus text-xs mr-1"></i>Estable</span>
          </div>
        </div>
      </div>

      <div className="solid-bg-white border-round-3xl shadow-4 p-5 border-1 border-200 mt-2">
        <div className="flex flex-column md:flex-row gap-4 mb-5 p-4 surface-50 border-round-2xl border-1 surface-border">
          <div className="flex flex-column gap-2 flex-1">
            <label className="text-xs font-bold text-color-secondary uppercase tracking-widest">Filtrar por Partido</label>
            <Dropdown value={selectedMatch} options={matchOptions} onChange={(e) => setSelectedMatch(e.value)} className="w-full border-round-lg" />
          </div>
          <div className="flex flex-column gap-2 flex-1">
            <label className="text-xs font-bold text-color-secondary uppercase tracking-widest">Fecha de Inicio</label>
            <Calendar value={filterDate} onChange={(e) => setFilterDate(e.value)} showIcon className="w-full border-round-lg" placeholder="Seleccionar Fecha" />
          </div>
          <div className="flex align-items-end">
            <Button icon="pi pi-filter" label="Aplicar" className="p-button-secondary border-round-lg shadow-1" />
          </div>
        </div>

        <div className="border-1 surface-border border-round-2xl overflow-hidden">
          {loading ? (
            <div className="flex justify-content-center p-6">
              <ProgressSpinner style={{ width: '3rem', height: '3rem' }} />
            </div>
          ) : error ? (
            <div className="p-5 text-center text-red-500">{error}</div>
          ) : (
            <DataTable value={reportData} paginator rows={10} footer={footer} className="p-datatable-lg border-none" rowHover stripedRows={false}>
              <Column field="title" header="Partido" sortable className="font-bold text-color pl-4" style={{ minWidth: '250px' }}></Column>
              <Column field="date" header="Fecha" body={dateTemplate} sortable></Column>
              <Column field="sold" header="Boletos Vendidos" sortable></Column>
              <Column field="revenue" header="Ingresos Totales" body={revenueTemplate} sortable></Column>
              <Column field="occupancy" header="Ocupación" body={occupancyTemplate} sortable style={{ width: '25%' }} className="pr-4"></Column>
            </DataTable>
          )}
        </div>
      </div>
    </div>
  );
}
