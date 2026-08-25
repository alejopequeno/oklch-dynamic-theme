import { useId } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export function PreviewComponents() {
  const projectNameId = useId();
  const heroTitleId = useId();
  return <div className="preview-content">
    <nav aria-label="Preview navigation" className="preview-nav"><strong>northstar</strong><DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>Menu</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Overview</DropdownMenuItem><DropdownMenuItem>Settings</DropdownMenuItem></DropdownMenuContent></DropdownMenu></nav>
    <main aria-labelledby={heroTitleId} className="preview-main"><p className="preview-eyebrow">Shadcn / Luma preview</p><h3 id={heroTitleId}>Good systems make room for better ideas.</h3><p className="preview-copy">Every semantic token is rendered through a real shadcn component.</p><div className="flex gap-2"><Button>Continue</Button><Button variant="secondary">Secondary</Button><Badge>Live</Badge></div>
      <Card className="mt-8"><CardHeader><CardTitle>Project settings</CardTitle><CardDescription>Common shadcn controls</CardDescription></CardHeader><CardContent className="grid gap-3"><Input aria-label="Project name" defaultValue="Atlas" id={projectNameId}/><Select defaultValue="studio"><SelectTrigger aria-label="Workspace"><SelectValue placeholder="Workspace" /></SelectTrigger><SelectContent><SelectItem value="studio">Studio</SelectItem><SelectItem value="personal">Personal</SelectItem></SelectContent></Select><Textarea defaultValue="A short project note." /><div className="flex items-center gap-3"><Checkbox id={`${projectNameId}-check`} defaultChecked/><label htmlFor={`${projectNameId}-check`}>Share updates</label><Switch defaultChecked /></div><Popover><PopoverTrigger render={<Button variant="outline" />}>Project update</PopoverTrigger><PopoverContent>New version ready.</PopoverContent></Popover></CardContent></Card>
      <Tabs className="mt-6" defaultValue="preview"><TabsList><TabsTrigger value="preview">Preview</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList><TabsContent value="preview">Tokens update live.</TabsContent><TabsContent value="activity">Published 2 minutes ago.</TabsContent></Tabs>
      <Alert className="mt-6"><AlertTitle>Review note</AlertTitle><AlertDescription>A review note needs your attention.</AlertDescription></Alert></main>
    <footer className="preview-footer"><Separator /><div><span>New York · Remote</span><span>© 2026</span></div></footer>
  </div>;
}
