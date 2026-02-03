import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const {
            id,
            title,
            category,
            price,
            quantity,
            description,
            country,
            min_order,
            packaging,
            packaging_size,
            image,
            contact_method,
            contact_info,
            country_code,
            phone_number,
            certifications,
            company_name,
            incoterm
        } = body

        if (!id) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        // Build full description with vendor info (same format as create)
        let fullDescription = description || ""
        if (company_name || contact_method) {
            const incotermValue = incoterm || "A definir con el comprador"
            fullDescription = `${description}\n\n---\nInformación del Vendedor:\nEmpresa: ${company_name || ""}\nContacto: ${contact_method || ""}\nIncoterm: ${incotermValue}`
        }

        // Build update object with only provided fields
        const updateData: Record<string, any> = {}
        if (title !== undefined) updateData.title = title
        if (category !== undefined) updateData.category = category
        if (price !== undefined) updateData.price = price
        if (quantity !== undefined) updateData.quantity = quantity
        if (description !== undefined) updateData.description = fullDescription
        if (country !== undefined) updateData.country = country
        if (min_order !== undefined) updateData.min_order = min_order
        if (packaging !== undefined) updateData.packaging = packaging
        if (packaging_size !== undefined) updateData.packaging_size = packaging_size
        if (image !== undefined) updateData.image = image
        if (contact_method !== undefined) updateData.contact_method = contact_method
        if (contact_info !== undefined) updateData.contact_info = contact_info
        if (country_code !== undefined) updateData.country_code = country_code
        if (phone_number !== undefined) updateData.phone_number = phone_number
        if (certifications !== undefined) updateData.certifications = certifications

        const { data, error } = await supabaseAdmin
            .from("user_products")
            .update(updateData)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Error updating product:", error)
            return NextResponse.json({ error: "Failed to update product", details: error.message }, { status: 500 })
        }

        console.log(`Product ${id} updated successfully`)

        return NextResponse.json({ success: true, product: data })

    } catch (error) {
        console.error("Error in update-product:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
