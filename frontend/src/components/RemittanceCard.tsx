type Props = { recipient: string; amount: number };
export default function RemittanceCard({ recipient, amount }: Props) { return <div>{recipient}: ${amount}</div>; }
