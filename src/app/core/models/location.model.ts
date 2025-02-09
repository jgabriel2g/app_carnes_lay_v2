export interface Department {
  id: string;
  name: string;
}

export interface Municipality {
  id: string;
  name: string;
  department: Department;
}
