"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Calendar, Mail, Phone, MessageSquare, Clock, Send, CheckCircle2 } from "lucide-react";

type EnquiryDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  createdAt: string;
};

export default function EnquiryDetailPage() {
  const { id } = useParams();
  const [enquiry, setEnquiry] = useState<EnquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      // Try vydhra first
      apiClient.get<EnquiryDetail>(`/vydhra/enquiries/${id}`)
        .then(setEnquiry)
        .catch((err) => {
          console.error("Failed to fetch enquiry:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="text-center py-20 border rounded-xl border-dashed">
        <p className="text-muted-foreground">Enquiry not found.</p>
        <Link href="/enquiries" className="mt-4 inline-block">
          <Button variant="outline">Back to Enquiries</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/enquiries">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Enquiry Preview</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            Mark as Contacted
          </Button>
          <Button size="sm" className="flex items-center gap-2 bg-indigo-600">
            <Send className="h-4 w-4" />
            Reply via Email
          </Button>
        </div>
      </div>

      {/* Enquiry Overview Card */}
      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={enquiry.status === 'NEW' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}>
                  {enquiry.status}
                </Badge>
                <span className="text-slate-400 text-xs font-mono">ID: {enquiry.id.slice(-8).toUpperCase()}</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight">{enquiry.name}</h2>
              <div className="flex gap-6 mt-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Mail className="h-4 w-4" />
                  {enquiry.email}
                </div>
                {enquiry.phone && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Phone className="h-4 w-4" />
                    {enquiry.phone}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
              <Calendar className="h-6 w-6 text-white mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Received</p>
              <p className="text-sm font-bold text-white">{new Date(enquiry.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Message Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 border-b pb-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              <h3 className="font-black uppercase text-xs tracking-widest">Client Message</h3>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-slate-700 leading-relaxed min-h-[150px]">
              &quot;{enquiry.message || "No specific message provided by the client."}&quot;
            </div>
          </div>

          {/* Action Log / Timeline (Mock) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 border-b pb-2">
              <Clock className="h-5 w-5 text-slate-400" />
              <h3 className="font-black uppercase text-xs tracking-widest">Audit Timeline</h3>
            </div>
            <div className="space-y-6 pl-4 border-l-2 border-slate-100 ml-2">
              <div className="relative">
                <div className="absolute -left-[25px] mt-1 h-4 w-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">Enquiry Received</p>
                  <p className="text-xs text-slate-500">System logged the enquiry from website frontend.</p>
                  <p className="text-[10px] text-slate-400 font-medium">{new Date(enquiry.createdAt).toLocaleTimeString()} - {new Date(enquiry.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[25px] mt-1 h-4 w-4 rounded-full bg-slate-200 border-4 border-white" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">Awaiting Response</p>
                  <p className="text-xs text-slate-400 italic">No actions recorded yet.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Suggestion */}
      <Card className="border-none shadow-sm bg-indigo-50/50 border border-indigo-100 p-6">
        <div className="flex gap-4 items-center">
          <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-900">Recommended Action</p>
            <p className="text-xs text-indigo-700/70">Our engine suggests contacting {enquiry.name.split(' ')[0]} via email within the next 4 hours to improve conversion rates.</p>
          </div>
          <Button size="sm" className="ml-auto bg-indigo-600 hover:bg-indigo-700">Send Now</Button>
        </div>
      </Card>
    </div>
  );
}
