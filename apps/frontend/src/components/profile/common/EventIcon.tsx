interface EventIconProps {
  width?: string | number;
  height?: string | number;
  textcolor?: string;
}

const EventIcon = ({
  width = "20",
  height = "20",
  textcolor = "#000000",
}: EventIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 14 14"
    style={{ color: textcolor }}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.2}
    >
      <path d="M9.5 3.5h4v4"></path>
      <path d="M13.5 3.5L7.85 9.15a.5.5 0 0 1-.7 0l-2.3-2.3a.5.5 0 0 0-.7 0L.5 10.5"></path>
    </g>
  </svg>
);

export default EventIcon;
