import Icon from '../UI/icon/Icon';

type iconProps = {
  className?: string;
  onClick?: () => void;
};

const ArrowDownIcon = ({ className, onClick }: iconProps) => {
  return (
    <Icon className={className} onClick={onClick}>
      <svg width='12' height='6' viewBox='0 0 12 6' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M6 6L0 0H12L6 6Z' fill='#333333' />
      </svg>
    </Icon>
  );
};

export default ArrowDownIcon;