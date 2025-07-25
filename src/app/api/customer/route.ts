
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prismaClient from '@/lib/prisma'


export async function DELETE(request: Request){
  const session = await getServerSession(authOptions);

  if(!session || !session.user){
    return NextResponse.json({ error: "Not authorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id")

  if(!userId){
    return NextResponse.json({ error: "Failed delete customer" }, { status: 400 })
  }


  const hasOpenTickets = await prismaClient.ticket.findFirst({
  where: {
    customerId: userId,
    status: 'ABERTO',
  },
});

if (hasOpenTickets) {
  return NextResponse.json({ error: "Failed delete customer: tickets abertos encontrados" }, { status: 400 });
}
  
  try{
    await prismaClient.customer.delete({
      where:{
        id: userId as string
      }
    })

    return NextResponse.json({ message: "Cliente deletado com sucesso!" })

  }catch(err){
    console.log(err);
    return NextResponse.json({ error: "Failed delete customer" }, { status: 400 })
  }
  
}

// Rota para cadastrar um cliente
export async function POST(request: Request){
  const session = await getServerSession(authOptions);

  if(!session || !session.user){
    return NextResponse.json({ error: "Not authorized" }, { status: 401 })
  }

  const { name, email, phone, address, userId } = await request.json();

  try{
    await prismaClient.customer.create({
      data:{
        name,
        phone,
        email,
        address: address ? address : "",
        userId: userId
      }
    })

    return NextResponse.json({ message: "Cliente cadastrado com sucesso!" })

  }catch(err){
    return NextResponse.json({ error: "Failed crete new customer" }, { status: 400 })
  }

}
