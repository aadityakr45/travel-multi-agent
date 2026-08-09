import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function LoginPage() {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Account sign-in isn't connected yet — you can plan trips without an
          account for now.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-email">Email</Label>
            <Input id="login-email" type="email" placeholder="you@example.com" disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-password">Password</Label>
            <Input id="login-password" type="password" disabled />
          </div>
          <Button type="submit" disabled className="w-full">
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link to="/" className="text-muted-foreground hover:underline">
            Continue as guest
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
