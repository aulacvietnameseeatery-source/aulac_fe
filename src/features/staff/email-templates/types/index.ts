export interface EmailTemplate {
    templateId: number;
    templateCode: string;
    templateName: string;
    subject: string;
    bodyHtml: string;
    description?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface UpdateEmailTemplateRequest {
    templateName: string;
    subject: string;
    bodyHtml: string;
    description?: string;
}

export interface CreateEmailTemplateRequest {
    templateCode: string;
    templateName: string;
    subject: string;
    bodyHtml: string;
    description?: string;
}
