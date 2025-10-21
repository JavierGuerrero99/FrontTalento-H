// Datos mock de trabajos para simular la plataforma
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: "Tiempo completo" | "Medio tiempo" | "Contrato" | "Freelance" | "Pasantía";
  category: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  applicants: number;
  companyLogo?: string;
  isRemote: boolean;
  experience: string;
}

export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Desarrollador Full Stack Senior",
    company: "TechCorp Colombia",
    location: "Bogotá, Colombia",
    salary: "$4.000.000 - $6.000.000 COP",
    type: "Tiempo completo",
    category: "Tecnología",
    description: "Buscamos un desarrollador full stack con experiencia en React, Node.js y bases de datos relacionales. Trabajarás en proyectos innovadores para clientes nacionales e internacionales.",
    requirements: [
      "3+ años de experiencia en desarrollo web",
      "Dominio de React y Node.js",
      "Experiencia con TypeScript",
      "Conocimiento en bases de datos SQL y NoSQL",
      "Inglés intermedio o avanzado"
    ],
    benefits: [
      "Salario competitivo",
      "Trabajo remoto flexible",
      "Seguro de salud",
      "Capacitación continua",
      "Días de vacaciones adicionales"
    ],
    postedDate: "2025-10-10",
    applicants: 45,
    isRemote: true,
    experience: "Senior"
  },
  {
    id: "2",
    title: "Diseñador UX/UI",
    company: "Creative Studio",
    location: "Medellín, Colombia",
    salary: "$3.500.000 - $5.000.000 COP",
    type: "Tiempo completo",
    category: "Diseño",
    description: "Estamos buscando un diseñador UX/UI creativo y apasionado para unirse a nuestro equipo. Trabajarás en el diseño de interfaces modernas y experiencias de usuario excepcionales.",
    requirements: [
      "2+ años de experiencia en diseño UX/UI",
      "Portafolio destacado",
      "Dominio de Figma y Adobe Creative Suite",
      "Conocimiento de principios de diseño centrado en el usuario",
      "Experiencia con sistemas de diseño"
    ],
    benefits: [
      "Ambiente creativo",
      "Herramientas de diseño premium",
      "Horario flexible",
      "Oportunidades de crecimiento",
      "Bonos por desempeño"
    ],
    postedDate: "2025-10-12",
    applicants: 32,
    isRemote: false,
    experience: "Semi-Senior"
  },
  {
    id: "3",
    title: "Gerente de Marketing Digital",
    company: "Marketing Pro",
    location: "Remoto",
    salary: "$5.000.000 - $7.500.000 COP",
    type: "Tiempo completo",
    category: "Marketing",
    description: "Buscamos un gerente de marketing digital para liderar estrategias de crecimiento digital, SEO, SEM y campañas en redes sociales para múltiples clientes.",
    requirements: [
      "4+ años de experiencia en marketing digital",
      "Experiencia liderando equipos",
      "Conocimiento profundo de Google Ads y Meta Ads",
      "Experiencia con analítica web (Google Analytics, etc.)",
      "Habilidades de comunicación excepcionales"
    ],
    benefits: [
      "100% remoto",
      "Salario competitivo + comisiones",
      "Equipamiento completo",
      "Capacitaciones internacionales",
      "Vacaciones flexibles"
    ],
    postedDate: "2025-10-08",
    applicants: 78,
    isRemote: true,
    experience: "Senior"
  },
  {
    id: "4",
    title: "Analista de Datos Junior",
    company: "DataInsights Co.",
    location: "Cali, Colombia",
    salary: "$2.500.000 - $3.500.000 COP",
    type: "Tiempo completo",
    category: "Datos",
    description: "Únete a nuestro equipo de datos como analista junior. Aprenderás a trabajar con grandes volúmenes de datos, crear dashboards y generar insights valiosos para nuestros clientes.",
    requirements: [
      "Título en Ingeniería, Estadística o afines",
      "Conocimiento de SQL",
      "Familiaridad con Python o R",
      "Conocimiento de herramientas de visualización (Tableau, Power BI)",
      "Capacidad analítica y atención al detalle"
    ],
    benefits: [
      "Programa de mentorías",
      "Capacitación en tecnologías de datos",
      "Crecimiento profesional acelerado",
      "Ambiente colaborativo",
      "Snacks y almuerzos"
    ],
    postedDate: "2025-10-14",
    applicants: 23,
    isRemote: false,
    experience: "Junior"
  },
  {
    id: "5",
    title: "Community Manager",
    company: "Social Media Agency",
    location: "Barranquilla, Colombia",
    salary: "$2.000.000 - $3.000.000 COP",
    type: "Medio tiempo",
    category: "Marketing",
    description: "Buscamos community manager para gestionar redes sociales de múltiples marcas. Crearás contenido atractivo y gestionarás la comunidad online de nuestros clientes.",
    requirements: [
      "1+ año de experiencia como community manager",
      "Excelente redacción y ortografía",
      "Creatividad para generar contenido",
      "Conocimiento de redes sociales principales",
      "Manejo de herramientas de programación"
    ],
    benefits: [
      "Horario flexible (medio tiempo)",
      "Trabajo remoto",
      "Ambiente joven y dinámico",
      "Posibilidad de tiempo completo",
      "Capacitaciones"
    ],
    postedDate: "2025-10-13",
    applicants: 56,
    isRemote: true,
    experience: "Junior"
  },
  {
    id: "6",
    title: "Ingeniero DevOps",
    company: "CloudTech Solutions",
    location: "Bogotá, Colombia",
    salary: "$6.000.000 - $9.000.000 COP",
    type: "Tiempo completo",
    category: "Tecnología",
    description: "Estamos buscando un ingeniero DevOps experimentado para optimizar nuestros procesos de CI/CD y gestionar infraestructura en la nube.",
    requirements: [
      "4+ años de experiencia en DevOps",
      "Experiencia con AWS o Azure",
      "Conocimiento de Docker y Kubernetes",
      "Experiencia con herramientas CI/CD (Jenkins, GitLab CI, etc.)",
      "Scripting con Python o Bash"
    ],
    benefits: [
      "Salario premium",
      "Certificaciones pagadas (AWS, Azure)",
      "Trabajo híbrido",
      "Equipamiento de alto rendimiento",
      "Bonos trimestrales"
    ],
    postedDate: "2025-10-11",
    applicants: 34,
    isRemote: true,
    experience: "Senior"
  },
  {
    id: "7",
    title: "Ejecutivo de Ventas B2B",
    company: "Sales Corp",
    location: "Medellín, Colombia",
    salary: "$2.500.000 + comisiones",
    type: "Tiempo completo",
    category: "Ventas",
    description: "Buscamos ejecutivo de ventas para desarrollo de nuevos clientes B2B. Excelente oportunidad con comisiones sin techo.",
    requirements: [
      "2+ años de experiencia en ventas B2B",
      "Habilidades de negociación",
      "Orientación a resultados",
      "Licencia de conducción (deseable)",
      "CRM experience"
    ],
    benefits: [
      "Comisiones ilimitadas",
      "Vehículo de la empresa",
      "Capacitación en ventas",
      "Plan carrera",
      "Bonos por cumplimiento"
    ],
    postedDate: "2025-10-09",
    applicants: 67,
    isRemote: false,
    experience: "Semi-Senior"
  },
  {
    id: "8",
    title: "Pasante de Recursos Humanos",
    company: "HR Consulting Group",
    location: "Bogotá, Colombia",
    salary: "$1.200.000 - $1.500.000 COP",
    type: "Pasantía",
    category: "Recursos Humanos",
    description: "Oportunidad de pasantía en recursos humanos. Aprenderás sobre reclutamiento, selección, capacitación y desarrollo organizacional.",
    requirements: [
      "Estudiante de últimos semestres de Psicología, Administración o afines",
      "Disponibilidad de 6 meses mínimo",
      "Buen manejo de Excel",
      "Actitud proactiva",
      "Buena comunicación"
    ],
    benefits: [
      "Experiencia profesional",
      "Certificado de prácticas",
      "Mentoría personalizada",
      "Horario de estudiante",
      "Posibilidad de vinculación"
    ],
    postedDate: "2025-10-15",
    applicants: 89,
    isRemote: false,
    experience: "Sin experiencia"
  },
  {
    id: "9",
    title: "Product Manager",
    company: "Startup Innovadora",
    location: "Remoto",
    salary: "$7.000.000 - $10.000.000 COP",
    type: "Tiempo completo",
    category: "Producto",
    description: "Buscamos product manager para liderar el desarrollo de nuevas funcionalidades en nuestra plataforma SaaS. Trabajarás directamente con founders y equipos técnicos.",
    requirements: [
      "3+ años de experiencia como PM",
      "Experiencia en productos digitales/SaaS",
      "Metodologías ágiles",
      "Habilidades de análisis y métricas",
      "Inglés avanzado"
    ],
    benefits: [
      "Salario top de mercado",
      "Stock options",
      "100% remoto",
      "Budget para cursos y conferencias",
      "Vacaciones ilimitadas"
    ],
    postedDate: "2025-10-07",
    applicants: 102,
    isRemote: true,
    experience: "Senior"
  },
  {
    id: "10",
    title: "Contador Público",
    company: "Contasoft Services",
    location: "Cartagena, Colombia",
    salary: "$3.000.000 - $4.500.000 COP",
    type: "Tiempo completo",
    category: "Contabilidad",
    description: "Firma contable busca contador público para gestión contable, fiscal y tributaria de múltiples clientes.",
    requirements: [
      "Título de Contador Público con tarjeta profesional",
      "2+ años de experiencia",
      "Conocimiento de normativa tributaria colombiana",
      "Manejo de software contable",
      "Atención al detalle"
    ],
    benefits: [
      "Estabilidad laboral",
      "Capacitaciones técnicas",
      "Crecimiento profesional",
      "Ambiente profesional",
      "Prestaciones de ley"
    ],
    postedDate: "2025-10-11",
    applicants: 41,
    isRemote: false,
    experience: "Semi-Senior"
  }
];

export const categories = [
  "Todas",
  "Tecnología",
  "Diseño",
  "Marketing",
  "Datos",
  "Ventas",
  "Recursos Humanos",
  "Producto",
  "Contabilidad"
];

export const jobTypes = [
  "Todos",
  "Tiempo completo",
  "Medio tiempo",
  "Contrato",
  "Freelance",
  "Pasantía"
];

export const experienceLevels = [
  "Todos",
  "Sin experiencia",
  "Junior",
  "Semi-Senior",
  "Senior"
];
