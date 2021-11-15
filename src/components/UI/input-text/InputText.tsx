type inputProps = {
  placeholder: string;
  id?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  validStatus?: string;
  type?: string;
};

const InputText = ({
  placeholder,
  id,
  onChange,
  value,
  validStatus,
  type
}: inputProps) => {
  return (
    <input
      placeholder={placeholder}
      type={type ? type : "text"}
      id={id}
      className={"input input--text " + (validStatus ? validStatus : "")}
      value={value}
      onChange={onChange}
    />
  );
};

export default InputText;