export default function RecruitmentIcon({ stroke = "white" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
    >
      <path
        d="M11.25 20.75H5.34087C3.79549 20.75 2.56631 19.998 1.46266 18.9466C-0.796635 16.7941 2.9128 15.074 4.32757 14.2316C6.42837 12.9807 8.88683 12.5219 11.25 12.8552C12.1075 12.9761 12.9426 13.2014 13.75 13.5309"
        stroke={stroke}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M15.25 5.25C15.25 7.73528 13.2353 9.75 10.75 9.75C8.26472 9.75 6.25 7.73528 6.25 5.25C6.25 2.76472 8.26472 0.75 10.75 0.75C13.2353 0.75 15.25 2.76472 15.25 5.25Z"
        stroke={stroke}
        stroke-width="1.5"
      />
      <path
        d="M17.25 20.75L17.25 13.75M13.75 17.25H20.75"
        stroke={stroke}
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
}
