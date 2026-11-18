export type FormState = { errors: Record<string, string>; values: Record<string, string> }
export const emptyFormState: FormState = { errors: {}, values: {} }
