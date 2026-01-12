import { Button } from '@vexeviet/ui';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold text-gray-900">VeXeViet</h1>
        <p className="text-lg text-gray-600">Platform initialization successful</p>
        
        <div className="flex gap-4 mt-8">
          <Button variant="default">Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        
        <div className="flex gap-4 mt-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>
    </main>
  )
}
