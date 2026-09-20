'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import ProductCard from '@/components/ProductCard';
import { getVisibleProducts, CATEGORIES, FILTROS, getPriceRange } from '@/lib/data';

// Recriado literalmente de design_files/catalog.html
// Melhoria 4: faixa de preço dinâmica (min/max calculados dos produtos reais, não texto fixo)
export default function CatalogClient() {
  const products = useMemo(() => getVisibleProducts(), []);
  const categories = CATEGORIES;
  const filtros = FILTROS;
  const priceRange = useMemo(() => getPriceRange(products), [products]);

  const estampasUnicas = useMemo(
    () => [...new Set(products.filter((p) => p.estampa).map((p) => p.estampa))],
    [products]
  );

  const params = useSearchParams();
  const initialCat = params.get('cat') || '';

  const [activeCat, setActiveCat] = useState(initialCat);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sort, setSort] = useState('featured');
  const [denomFilter, setDenomFilter] = useState(new Set());
  const [yearFilter, setYearFilter] = useState(new Set());
  const [stateFilter, setStateFilter] = useState(new Set());
  const [estampaFilter, setEstampaFilter] = useState(new Set());
  const [tipoFilter, setTipoFilter] = useState('');
  const [perPage, setPerPage] = useState(24);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setActiveCat(params.get('cat') || '');
  }, [params]);

  const toggle = (setter) => (val) =>
    setter((prev) => {
      const s = new Set(prev);
      if (s.has(val)) s.delete(val);
      else s.add(val);
      return s;
    });

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCat) {
      if (activeCat === 'raridades') list = list.filter((p) => p.seals && p.seals.includes('rare'));
      else list = list.filter((p) => p.category === activeCat);
    }
    if (denomFilter.size) list = list.filter((p) => denomFilter.has(p.denomination));
    if (yearFilter.size) list = list.filter((p) => yearFilter.has(p.year));
    if (stateFilter.size) list = list.filter((p) => stateFilter.has(p.state));
    if (estampaFilter.size) list = list.filter((p) => estampaFilter.has(p.estampa));
    if (tipoFilter === 'sequencia') list = list.filter((p) => p.isSequencia);
    if (tipoFilter === 'lote') list = list.filter((p) => p.quantidade > 1 && !p.isSequencia);
    if (tipoFilter === 'autografada') list = list.filter((p) => p.variedade === 'Autografada');
    if (tipoFilter === 'rara') list = list.filter((p) => p.seals && p.seals.includes('rare'));
    if (priceMin) list = list.filter((p) => p.price >= Number(priceMin));
    if (priceMax) list = list.filter((p) => p.price <= Number(priceMax));
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'year-asc') list.sort((a, b) => a.year - b.year);
    if (sort === 'year-desc') list.sort((a, b) => b.year - a.year);
    if (sort === 'state') list.sort((a, b) => (a.state || '').localeCompare(b.state || ''));
    return list;
  }, [products, activeCat, denomFilter, yearFilter, stateFilter, estampaFilter, tipoFilter, priceMin, priceMax, sort]);

  useEffect(() => {
    setPage(1);
  }, [activeCat, denomFilter, yearFilter, stateFilter, estampaFilter, tipoFilter, priceMin, priceMax, sort, perPage]);

  const totalPages = perPage === Infinity ? 1 : Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const startIdx = perPage === Infinity ? 0 : (safePage - 1) * perPage;
  const endIdx = perPage === Infinity ? filtered.length : Math.min(startIdx + perPage, filtered.length);
  const pageItems = filtered.slice(startIdx, endIdx);

  const activeName = activeCat ? categories.find((c) => c.slug === activeCat)?.name || 'Raridades' : 'Todo o Acervo';

  const clearAll = () => {
    setActiveCat('');
    setPriceMin('');
    setPriceMax('');
    setDenomFilter(new Set());
    setYearFilter(new Set());
    setStateFilter(new Set());
    setEstampaFilter(new Set());
    setTipoFilter('');
  };

  const hasFilters =
    activeCat || priceMin || priceMax || denomFilter.size || yearFilter.size || stateFilter.size || estampaFilter.size || tipoFilter;

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const arr = [1];
    if (safePage > 3) arr.push('...');
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) arr.push(i);
    if (safePage < totalPages - 2) arr.push('...');
    arr.push(totalPages);
    return arr;
  }, [totalPages, safePage]);

  const isCedulas = activeCat === 'cedulas-br' || !activeCat;

  return (
    <>
      <Header page="catalog" />

      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Início</Link>
            <span className="sep">/</span>
            <span>Catálogo</span>
            {activeCat && (
              <>
                <span className="sep">/</span>
                <span>{activeName}</span>
              </>
            )}
          </div>
          <h1 className="h1">{activeName}</h1>
          <p className="lede">
            {activeCat === 'raridades' &&
              'Peças excepcionais reservadas para colecionadores exigentes. Cada exemplar é único em nosso acervo.'}
            {activeCat === 'cedulas-br' &&
              'Cédulas brasileiras do padrão Cruzeiro (1942-1967), autenticadas e catalogadas peça a peça pelo Dr. Sergio Costa.'}
            {!activeCat && `Todo o acervo curado pela La Zecca — ${products.length} peças autenticadas. Filtre por denominação, ano, estado ou período.`}
            {activeCat && !['raridades', 'cedulas-br'].includes(activeCat) && `Peças da categoria ${activeName.toLowerCase()}, autenticadas e catalogadas.`}
          </p>
        </div>
      </section>

      <div className="container">
        <div className="catalog-layout">
          <aside className="catalog-sidebar">
            <div className="filter-group" style={{ paddingTop: 32 }}>
              <h4>
                <Icon name="sliders" size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Categoria
              </h4>
              <ul className="filter-list">
                <li className={!activeCat ? 'active' : ''} onClick={() => setActiveCat('')}>
                  <span>Todas</span>
                  <span className="count">{products.length}</span>
                </li>
                {categories.map((c) => (
                  <li key={c.slug} className={activeCat === c.slug ? 'active' : ''} onClick={() => setActiveCat(c.slug)}>
                    <span>{c.name}</span>
                    <span className="count">{c.count}</span>
                  </li>
                ))}
                <li className={activeCat === 'raridades' ? 'active' : ''} onClick={() => setActiveCat('raridades')}>
                  <span>
                    <Icon name="sparkles" size={12} style={{ verticalAlign: 'middle', color: 'var(--gold-700)' }} /> Raridades
                  </span>
                  <span className="count">{products.filter((p) => p.seals && p.seals.includes('rare')).length}</span>
                </li>
              </ul>
            </div>

            {isCedulas && (
              <>
                <div className="filter-group">
                  <h4>Denominação</h4>
                  <ul className="filter-list">
                    {filtros.denominacoes.map((d) => (
                      <li key={d.nome}>
                        <label>
                          <input type="checkbox" checked={denomFilter.has(d.nome)} onChange={() => toggle(setDenomFilter)(d.nome)} />
                          <span>{d.nome.replace('CRUZEIROS', 'Cruzeiros').replace('CRUZEIRO', 'Cruzeiro')}</span>
                        </label>
                        <span className="count">{d.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="filter-group">
                  <h4>Ano de Emissão</h4>
                  <ul className="filter-list">
                    {filtros.anos.map((a) => (
                      <li key={a.ano}>
                        <label>
                          <input type="checkbox" checked={yearFilter.has(a.ano)} onChange={() => toggle(setYearFilter)(a.ano)} />
                          <span>{a.ano}</span>
                        </label>
                        <span className="count">{a.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="filter-group">
                  <h4>Estado de Conservação</h4>
                  <ul className="filter-list">
                    {filtros.estados.map((e) => (
                      <li key={e.estado}>
                        <label>
                          <input type="checkbox" checked={stateFilter.has(e.estado)} onChange={() => toggle(setStateFilter)(e.estado)} />
                          <span>
                            {e.estado === 'FE'
                              ? 'Flor de Estampa (FE)'
                              : e.estado === 'SOB'
                              ? 'Soberba (SOB)'
                              : e.estado === 'MBC'
                              ? 'Muito Bem Conservada (MBC)'
                              : e.estado === 'BC'
                              ? 'Bem Conservada (BC)'
                              : e.estado}
                          </span>
                        </label>
                        <span className="count">{e.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="filter-group">
                  <h4>Estampa / Família</h4>
                  <ul className="filter-list">
                    {estampasUnicas.map((e) => (
                      <li key={e}>
                        <label>
                          <input type="checkbox" checked={estampaFilter.has(e)} onChange={() => toggle(setEstampaFilter)(e)} />
                          <span>{e}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="filter-group">
                  <h4>Tipo de Peça</h4>
                  <ul className="filter-list">
                    <li className={tipoFilter === '' ? 'active' : ''} onClick={() => setTipoFilter('')}>
                      <span>Todas</span>
                    </li>
                    <li
                      className={tipoFilter === 'sequencia' ? 'active' : ''}
                      onClick={() => setTipoFilter(tipoFilter === 'sequencia' ? '' : 'sequencia')}
                    >
                      <span>Em sequência numérica</span>
                      <span className="count">{products.filter((p) => p.isSequencia).length}</span>
                    </li>
                    <li className={tipoFilter === 'lote' ? 'active' : ''} onClick={() => setTipoFilter(tipoFilter === 'lote' ? '' : 'lote')}>
                      <span>Em lote (múltiplas)</span>
                      <span className="count">{products.filter((p) => p.quantidade > 1 && !p.isSequencia).length}</span>
                    </li>
                    <li
                      className={tipoFilter === 'autografada' ? 'active' : ''}
                      onClick={() => setTipoFilter(tipoFilter === 'autografada' ? '' : 'autografada')}
                    >
                      <span>Variedade autografada</span>
                      <span className="count">{products.filter((p) => p.variedade === 'Autografada').length}</span>
                    </li>
                    <li className={tipoFilter === 'rara' ? 'active' : ''} onClick={() => setTipoFilter(tipoFilter === 'rara' ? '' : 'rara')}>
                      <span>
                        <Icon name="sparkles" size={12} style={{ color: 'var(--gold-700)' }} /> Raras
                      </span>
                      <span className="count">{products.filter((p) => p.seals && p.seals.includes('rare')).length}</span>
                    </li>
                  </ul>
                </div>
              </>
            )}

            <div className="filter-group">
              <h4>Faixa de Preço</h4>
              <div className="price-slider">
                <input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
                <span style={{ color: 'var(--ink-400)' }}>—</span>
                <input type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 10 }}>
                De R$ {priceRange.min} a R$ {priceRange.max.toLocaleString('pt-BR')}
              </div>
            </div>

            {hasFilters && (
              <div style={{ padding: '16px 0' }}>
                <button className="btn btn-ghost btn-sm btn-block" onClick={clearAll}>
                  <Icon name="x" size={14} /> Limpar todos os filtros
                </button>
              </div>
            )}
          </aside>

          <main className="catalog-main">
            <div className="toolbar">
              <div className="result-count">
                {perPage === Infinity || filtered.length <= perPage ? (
                  <>
                    Exibindo <b>{filtered.length}</b> de <b>{products.length}</b> peças
                  </>
                ) : (
                  <>
                    Exibindo{' '}
                    <b>
                      {startIdx + 1}–{endIdx}
                    </b>{' '}
                    de <b>{filtered.length}</b> peças filtradas ({products.length} no acervo)
                  </>
                )}
              </div>
              <div className="toolbar-right">
                <select
                  className="sort-select"
                  value={perPage === Infinity ? 'all' : String(perPage)}
                  onChange={(e) => setPerPage(e.target.value === 'all' ? Infinity : Number(e.target.value))}
                >
                  <option value="12">Exibir: 12 por página</option>
                  <option value="24">Exibir: 24 por página</option>
                  <option value="48">Exibir: 48 por página</option>
                  <option value="all">Exibir: Todos ({filtered.length})</option>
                </select>
                <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="featured">Ordenar: Destaques</option>
                  <option value="price-asc">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                  <option value="year-asc">Mais antigas</option>
                  <option value="year-desc">Mais recentes</option>
                  <option value="state">Por conservação</option>
                </select>
              </div>
            </div>

            {hasFilters && (
              <div className="active-filters">
                {activeCat && (
                  <span className="filter-chip">
                    {activeName}
                    <span className="remove" onClick={() => setActiveCat('')}>
                      <Icon name="x" size={12} />
                    </span>
                  </span>
                )}
                {[...denomFilter].map((d) => (
                  <span key={d} className="filter-chip">
                    {d.replace('CRUZEIROS', 'Cruzeiros').replace('CRUZEIRO', 'Cruzeiro')}
                    <span className="remove" onClick={() => toggle(setDenomFilter)(d)}>
                      <Icon name="x" size={12} />
                    </span>
                  </span>
                ))}
                {[...yearFilter].map((y) => (
                  <span key={y} className="filter-chip">
                    Ano {y}
                    <span className="remove" onClick={() => toggle(setYearFilter)(y)}>
                      <Icon name="x" size={12} />
                    </span>
                  </span>
                ))}
                {[...stateFilter].map((s) => (
                  <span key={s} className="filter-chip">
                    Estado {s}
                    <span className="remove" onClick={() => toggle(setStateFilter)(s)}>
                      <Icon name="x" size={12} />
                    </span>
                  </span>
                ))}
                {[...estampaFilter].map((e) => (
                  <span key={e} className="filter-chip">
                    {e}
                    <span className="remove" onClick={() => toggle(setEstampaFilter)(e)}>
                      <Icon name="x" size={12} />
                    </span>
                  </span>
                ))}
                {tipoFilter && (
                  <span className="filter-chip">
                    {tipoFilter === 'sequencia' && 'Em sequência'}
                    {tipoFilter === 'lote' && 'Em lote'}
                    {tipoFilter === 'autografada' && 'Autografada'}
                    {tipoFilter === 'rara' && 'Rara'}
                    <span className="remove" onClick={() => setTipoFilter('')}>
                      <Icon name="x" size={12} />
                    </span>
                  </span>
                )}
                {priceMin && (
                  <span className="filter-chip">
                    Min: R$ {priceMin}
                    <span className="remove" onClick={() => setPriceMin('')}>
                      <Icon name="x" size={12} />
                    </span>
                  </span>
                )}
                {priceMax && (
                  <span className="filter-chip">
                    Max: R$ {priceMax}
                    <span className="remove" onClick={() => setPriceMax('')}>
                      <Icon name="x" size={12} />
                    </span>
                  </span>
                )}
              </div>
            )}

            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-500)' }}>
                <Icon name="search" size={40} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                <h3 className="h3">Nenhuma peça corresponde a esses filtros</h3>
                <p style={{ marginTop: 8 }}>Ajuste os critérios para explorar outras peças do acervo.</p>
                <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={clearAll}>
                  Limpar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {pageItems.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="pagination" aria-label="Paginação">
                    <button
                      onClick={() => {
                        setPage(safePage - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={safePage === 1}
                      aria-label="Página anterior"
                    >
                      <Icon name="chevron-left" size={16} />
                    </button>
                    {pageNumbers.map((n, i) =>
                      n === '...' ? (
                        <span key={`e${i}`} style={{ color: 'var(--ink-400)', padding: '0 8px' }}>
                          …
                        </span>
                      ) : (
                        <button
                          key={n}
                          className={n === safePage ? 'active' : ''}
                          onClick={() => {
                            setPage(n);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          aria-label={`Página ${n}`}
                          aria-current={n === safePage ? 'page' : undefined}
                        >
                          {n}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => {
                        setPage(safePage + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={safePage === totalPages}
                      aria-label="Próxima página"
                    >
                      <Icon name="chevron-right" size={16} />
                    </button>
                  </nav>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}
