export default function EKGLine() {
  return (
    <div className="flex justify-center my-4 w-full max-w-xl mx-auto px-4" aria-hidden="true">
      <svg
        width="100%"
        viewBox="0 0 600 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* pathLength=1 normalizes the draw so .ekg-line's dasharray/dashoffset
            of 1 covers the full path regardless of geometric length */}
        <path
          pathLength="1"
          d="M0,24 L80,24 L100,24 L120,4 L140,44 L155,10 L170,38 L185,18 L200,24
             L260,24 L280,24 L300,4 L320,44 L335,10 L350,38 L365,18 L380,24
             L440,24 L460,24 L480,4 L500,44 L515,10 L530,38 L545,18 L560,24 L600,24"
          style={{ stroke: "var(--accent)" }}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ekg-line"
        />
      </svg>
    </div>
  );
}
