type TProps = {
  to: string;
  from: string;
};

export default function Hello(props: TProps) {
  const { to, from } = props;

  console.log('Hello');

  return (
    <>
      <div>
        Hello {to} from {from}
      </div>
    </>
  );
}
