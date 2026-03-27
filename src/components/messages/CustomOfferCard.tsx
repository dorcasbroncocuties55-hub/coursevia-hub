import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  offer: any;
  isOwner: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
};

const CustomOfferCard = ({ offer, isOwner, onAccept, onDecline }: Props) => {
  const statusColor = offer.status === "accepted" ? "bg-green-100 text-green-700" : offer.status === "declined" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";

  return (
    <Card className="p-4 my-2">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm">Custom Offer</span>
        <Badge className={statusColor}>{offer.status || "pending"}</Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{offer.description || offer.title}</p>
      <p className="font-bold text-foreground">${Number(offer.amount || 0).toFixed(2)}</p>
      {!isOwner && offer.status === "pending" && (
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={onAccept}>Accept</Button>
          <Button size="sm" variant="outline" onClick={onDecline}>Decline</Button>
        </div>
      )}
    </Card>
  );
};

export default CustomOfferCard;
