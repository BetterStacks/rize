'use client'

import { createOrganization } from '@/actions/organization-actions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { uploadMedia } from '@/actions/media-actions'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { queryClient } from '@/lib/providers'
import { updateOrganization } from '@/actions/organization-actions'

const ORG_TYPES = [
    'Company',
    'Startup',
    'School',
    'College',
    'University',
    'NGO',
    'Hospital',
    'Clinic',
    'Government Office',
    'Club / Community',
    'Restaurant / Café',
    'Gym / Fitness Center',
    'Shop / Store',
    'Temple / Church / Mosque',
    'Trust / Foundation',
]

type Props = {
    isOpen: boolean
    onClose: () => void
    username: string
    editData?: any
}

export default function OrganizationFormModal({ isOpen, onClose, username, editData }: Props) {
    const [loading, setLoading] = useState(false)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string>('')
    const [formData, setFormData] = useState({
        name: editData?.name || '',
        type: editData?.type || '',
        description: editData?.description || '',
        address: editData?.address || '',
        email: editData?.email || '',
        phone: editData?.phone || '',
        website: editData?.website || '',
        foundedYear: editData?.foundedYear || new Date().getFullYear(),
    })

    useEffect(() => {
        if (editData) {
            setFormData({
                name: editData.name,
                type: editData.type,
                description: editData.description,
                address: editData.address,
                email: editData.email,
                phone: editData.phone,
                website: editData.website,
                foundedYear: editData.foundedYear,
            })
            setLogoPreview(editData.logo?.url || '')
        }
    }, [editData])

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Invalid file type. Please use JPEG, PNG, or WebP.')
            return
        }

        // Validate dimensions
        const img = new window.Image()
        img.onload = () => {
            if (img.width !== 1024 || img.height !== 1024) {
                toast.error('Logo must be exactly 1024 × 1024 pixels.')
                return
            }
            setLogoFile(file)
            setLogoPreview(URL.createObjectURL(file))
        }
        img.src = URL.createObjectURL(file)
    }

    const isValidUrl = (url: string) => {
        try {
            new URL(url)
            return true
        } catch {
            return false
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.type) {
            toast.error('Please select organization type')
            return
        }

        if (!isValidUrl(formData.website)) {
            toast.error('Please enter a valid website URL')
            setLoading(false)
            return
        }

        setLoading(true)

        try {
            let logoId = editData?.logo?.id

            // Upload new logo if changed
            if (logoFile) {
                const uploadResult = await uploadMedia(logoFile, username)
                if (!uploadResult.success || !uploadResult.data) {
                    toast.error('Failed to upload logo')
                    setLoading(false)
                    return
                }
                logoId = uploadResult.data.id
            }

            if (!logoId) {
                toast.error('Please upload a logo')
                setLoading(false)
                return
            }

            // Create organization
            const result = editData 
                ? await updateOrganization(editData.id, { ...formData, logo: logoId })
                : await createOrganization({ ...formData, logo: logoId })

            if (result.success) {
                toast.success(editData ? 'Updated!' : 'Created!')
                queryClient.invalidateQueries({ queryKey: ['organizations', username] })
                onClose()
                
                // Reset form
                setFormData({
                    name: '',
                    type: '',
                    description: '',
                    address: '',
                    email: '',
                    phone: '',
                    website: '',
                    foundedYear: new Date().getFullYear(),
                })
                setLogoFile(null)
                setLogoPreview('')
            } else {
                toast.error(result.error || 'Failed')
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editData ? 'Update Organization' : 'Create Organization'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Name</Label>
                        <Input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Rize Pvt Ltd"
                        />
                    </div>

                    <div>
                        <Label>Type</Label>
                        <Select required value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {ORG_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Logo (1024 × 1024)</Label>
                        <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoChange} required={!editData} />
                        {logoPreview && (
                            <div className="mt-2">
                                <Image src={logoPreview} alt="Logo preview" width={100} height={100} className="rounded-lg" />
                            </div>
                        )}
                    </div>

                    <div>
                        <div className='flex justify-between items-center'>
                            <Label>Description</Label>
                            <p className="text-xs text-neutral-500 mt-1">
                                {formData.description.length}/500 characters
                            </p>
                        </div>
                        <Textarea
                            required
                            value={formData.description}
                            onChange={(e) => { if (e.target.value.length <= 500) { setFormData({ ...formData, description: e.target.value }) } }}
                            placeholder="Tech-based food delivery startup"
                            maxLength={500}
                            rows={8}
                            style={{ resize: 'none' }}
                        />
                    </div>

                    <div>
                        <Label>Address</Label>
                        <Input
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Mumbai"
                        />
                    </div>

                    <div>
                        <Label>Email</Label>
                        <Input
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="hello@rize.com"
                        />
                    </div>

                    <div>
                        <Label>Phone</Label>
                        <Input
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91 9000000000"
                        />
                    </div>

                    <div>
                        <Label>Website</Label>
                        <Input
                            required
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://rize.so"
                        />
                    </div>

                    <div>
                        <Label>Founded Year</Label>
                        <Input
                            required
                            type="number"
                            value={formData.foundedYear}
                            onChange={(e) => setFormData({ ...formData, foundedYear: parseInt(e.target.value) })}
                            placeholder="2024"
                            min="1800" 
                            max={new Date().getFullYear()}
                        />
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? ( <Loader2 className="animate-spin disabled:opacity-50" /> ) : editData ? ( 'Update Organization' ) : ( 'Create Organization') }
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}