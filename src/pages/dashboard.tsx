import { Users, Store, UserStar} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <>
      {/* Header section */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, Head Admin
        </h1>
        <p className="text-muted-foreground">
          Here is what is happening with your system today.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Users"
          value="Placeholder pa lang"
          icon={<Users className="text-blue-500" />}
        />
          <StatCard
            title="Total Vendors"
            value="Placeholder pa lang"
            icon={<UserStar className="text-gray-500" />}
          />
        <StatCard
          title="Active Stalls"
          value="Placeholder pa lang"
          icon={<Store className="text-green-500" />}
        />
        <StatCard
          title="Inactive Stalls"
          value="Placeholder pa lang"
          icon={<Store className="text-gray-500" />}
        />
      </div>

      {/* Content Placeholder */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-md text-muted-foreground">
            Main management table or charts will go here.
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Keep this helper component here or move it to its own file in /components
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
