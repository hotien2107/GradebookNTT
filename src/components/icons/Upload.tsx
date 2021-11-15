import Icon from "../UI/icon/Icon";

type iconProps = {
  className?: string;
};

const UploadIcon = ({ className }: iconProps) => {
  return (
    <Icon className={className}>
      <svg
        width="20"
        height="19"
        viewBox="0 0 20 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 17H18V10H20V18C20 18.2652 19.8946 18.5196 19.7071 18.7071C19.5196 18.8946 19.2652 19 19 19H1C0.734784 19 0.48043 18.8946 0.292893 18.7071C0.105357 18.5196 0 18.2652 0 18V10H2V17ZM12 7V13H8V7H3L10 0L17 7H12Z"
          fill="#333333"
        />
      </svg>
    </Icon>
  );
};

export default UploadIcon;
