import EventDetailPage from "@/pages/events-page/detail";

export default async function EventsDetail({
    params,
}:{
    params: Promise <{id: string }>
}){
    const { id } = await params
    return (
    <div>
      <EventDetailPage id={id} />
    </div>
    )
}
//   return (
