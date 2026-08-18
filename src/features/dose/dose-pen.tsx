import type { DoseMg } from "@/types/experience";

interface DosePenProps {
  dose: DoseMg;
}

export function DosePen({ dose }: DosePenProps) {
  const liquidWidth = 42 + ((dose - 2.5) / 12.5) * 44;

  return (
    <svg
      aria-label={`像素风虚拟注射笔，当前显示 ${dose} mg`}
      className="dose-pen pixel-art h-auto w-full"
      role="img"
      viewBox="0 0 360 150"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g shapeRendering="crispEdges">
        <path d="M8 72h20v6H8z" fill="#68576e" />
        <path d="M20 66h15v18H20z" fill="#968598" />
        <path d="M31 59h16v32H31z" fill="#f7c0cc" />
        <path d="M35 63h8v24h-8z" fill="#fff5e9" />

        <path d="M45 51h229v48H45z" fill="#fff8ee" />
        <path d="M45 51h229v8H45z" fill="#ead9d6" />
        <path d="M45 91h229v8H45z" fill="#dccacc" />
        <path d="M51 59h15v32H51z" fill="#b8a8ae" />

        <path d="M72 57h105v36H72z" fill="#806c7d" />
        <path d="M77 61h95v28H77z" fill="#fbdbe5" />
        <path d={`M81 65h${liquidWidth}v20H81z`} fill="#f08caf" />
        <path d="M81 65h86v7H81z" fill="#ffeaf1" fillOpacity=".75" />
        <path d="M94 65h7v20h-7zM119 65h7v20h-7zM144 65h7v20h-7z" fill="#fff" fillOpacity=".32" />

        <path d="M183 59h74v32h-74z" fill="#fffdf8" />
        <path d="M183 59h8v32h-8z" fill="#f3e3df" />
        <text
          fill="#68576e"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fontWeight="800"
          textAnchor="middle"
          x="219"
          y="78"
        >
          PLAY ONLY
        </text>

        <path d="M257 55h21v40h-21z" fill="#5b4866" />
        <path d="M262 62h11v26h-11z" fill="#f9a1bd" />

        <path d="M274 47h52v56h-52z" fill="#ff779f" />
        <path d="M282 47h36v8h-36z" fill="#ffb3ca" />
        <path d="M282 95h36v8h-36z" fill="#d84d79" />
        <path d="M326 55h19v40h-19z" fill="#ef668e" />
        <path d="M345 63h7v24h-7z" fill="#b63d69" />

        <path d="M192 67h54v17h-54z" fill="#f0e9ef" />
        <path d="M197 70h44v11h-44z" fill="#655070" />
        <text
          fill="#ffffff"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fontWeight="900"
          textAnchor="middle"
          x="219"
          y="79"
        >
          {dose} mg
        </text>

        <path d="M58 45h18v6H58zM283 39h18v8h-18zM329 103h10v8h-10z" fill="#ffffff" />
      </g>
    </svg>
  );
}
