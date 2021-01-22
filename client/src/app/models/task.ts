export class Task {
    constructor(
        public _id: string,
        public user: string,
        public title: string,
        public content: string,
        public status: string,
        public create_at: string
    ){}
}