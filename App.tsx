import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import Home from "@/pages/Home";
import Assessment from "@/pages/Assessment";
import Results from "@/pages/Results";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

function Navbar() {
  return (
    <nav className="bg-primary/10 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <Button variant="link" className="text-xl font-bold text-primary">
            BeautyMap
          </Button>
        </Link>
        <div className="flex gap-4">
          <Link href="/assessment">
            <Button variant="ghost">Assessment</Button>
          </Link>
          <Link href="/results">
            <Button variant="ghost">Results</Button>
          </Link>
          <Link href="/contact">
            <Button variant="ghost">Contact</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/assessment" component={Assessment} />
            <Route path="/results" component={Results} />
            <Route path="/contact" component={Contact} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
