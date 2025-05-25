import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface OrderWithClient {
  id: string
  title: string
  description: string | null
  client_id: string
  client: { name: string }[]
  cost: number
  deadline: string
  status: "pending" | "complete" | "overdue"
  payment_status: "unpaid" | "partial" | "paid"
  created_at: string
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const [order, setOrder] = useState<OrderWithClient | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!id) return
    supabase
      .from("orders")
      .select(`*, client:clients(name)`)
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) throw error
        setOrder({
          ...data!,
          // flatten array
          client: Array.isArray(data!.client) ? data!.client : [data!.client],
        } as any)
      })
      .catch((e) => toast({ variant: "destructive", title: "Load failed", description: e.message }))
      .finally(() => setLoading(false))
  }, [id])

  const markComplete = async () => {
    if (!order) return
    const { error } = await supabase
      .from("orders")
      .update({ status: "complete" })
      .eq("id", order.id)
    if (error) return toast({ variant: "destructive", title: "Update failed", description: error.message })
    toast({ title: "Marked complete" })
    nav("/orders")  // back to list
  }

  if (loading) return <p>Loading…</p>
  if (!order) return <p>Not found.</p>

  const clientName = order.client[0]?.name || "Unknown"
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(v)

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{order.title}</h1>
          <p className="text-sm text-muted-foreground">
            {clientName} • <code>{order.id}</code>
          </p>
          <p className="mt-1 text-sm">
            <span className="font-medium">Payment Status:</span>{" "}
            {order.payment_status[0].toUpperCase() + order.payment_status.slice(1)}
          </p>
        </div>
        {order.status !== "complete" && (
          <Button onClick={markComplete}>Mark Complete</Button>
        )}
      </header>
      <hr />
      {order.description && <p className="whitespace-pre-wrap">{order.description}</p>}
      <footer className="flex justify-between text-sm text-muted-foreground border-t pt-4">
        <span>
          <span className="font-medium">Deadline:</span>{" "}
          {format(new Date(order.deadline), "MMMM d, yyyy")}
        </span>
        <span>
          <span className="font-medium">Cost:</span> {fmt(order.cost)}
        </span>
      </footer>
    </div>
  )
}
