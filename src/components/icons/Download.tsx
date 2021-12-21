import Icon from '../UI/icon/Icon';

type iconProps = {
  className?: string;
  onClick?: () => void;
};

const DownloadIcon = ({ className, onClick }: iconProps) => {
  return (
    <Icon className={className} onClick={onClick}>
      <svg width='20' height='18' viewBox='0 0 20 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M2 16H18V9H20V17C20 17.2652 19.8946 17.5196 19.7071 17.7071C19.5196 17.8946 19.2652 18 19 18H1C0.734784 18 0.48043 17.8946 0.292893 17.7071C0.105357 17.5196 0 17.2652 0 17V9H2V16ZM12 6H17L10 13L3 6H8V0H12V6Z'
          fill='#333333'
        />
      </svg>
    </Icon>
  );
};

export default DownloadIcon;
