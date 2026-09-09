// Franja de banderín a cuadros, usada como línea de meta abstracta.
// Es el único elemento decorativo "llamativo" del panel; todo lo demás
// se mantiene sobrio a propósito.
function FinishLine() {
  const squares = Array.from({ length: 24 });
  return (
    <div className="grid grid-cols-12 overflow-hidden rounded-sm">
      {squares.map((_, i) => {
        const row = Math.floor(i / 12);
        const col = i % 12;
        const isDark = (row + col) % 2 === 0;
        return (
          <div
            key={i}
            className={`aspect-square ${isDark ? "bg-dune-950" : "bg-sand-100"}`}
          />
        );
      })}
    </div>
  );
}

export default function BrandPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-dune-950 px-12 py-14 lg:flex">
      {/* Líneas de carril del desierto, tenues, saliendo hacia el borde inferior */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 opacity-40"
        style={{
          background:
            "repeating-linear-gradient(100deg, transparent 0 78px, rgba(227,176,75,0.10) 78px 80px)",
        }}
      />

      <div className="relative">
        <p className="font-display text-lg font-semibold tracking-tight text-sand-100">
          EIA Racing League
        </p>
      </div>

      <div className="relative max-w-md">
        <div className="mb-8 w-40">
          <FinishLine />
        </div>
        <h2 className="font-display text-4xl font-medium leading-tight text-sand-100">
          Camellos, enanos y una tabla de posiciones que por fin no vive en un Excel.
        </h2>
        <p className="mt-5 font-body text-sm leading-relaxed text-sand-300/80">
          Administra competidores, equipos, carreras y resultados de la liga
          desde un solo lugar — con roles claros para administradores,
          organizadores y espectadores.
        </p>
      </div>

      <div className="relative font-body text-xs text-sand-300/50">
        Universidad EIA · Proyecto de Backend Development
      </div>
    </div>
  );
}
