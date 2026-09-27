import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API documentation",
  description: "Swagger / OpenAPI documentation for the Sinza Coffee Shop platform API.",
};

export default function DocsPage() {
  return (
    <div className="bg-white">
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
      <div id="swagger-ui" className="min-h-screen" />
      <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js" defer />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('load', function () {
              if (window.SwaggerUIBundle) {
                window.SwaggerUIBundle({ url: '/api/docs', dom_id: '#swagger-ui', deepLinking: true });
              } else {
                var t = setInterval(function () {
                  if (window.SwaggerUIBundle) {
                    clearInterval(t);
                    window.SwaggerUIBundle({ url: '/api/docs', dom_id: '#swagger-ui', deepLinking: true });
                  }
                }, 200);
              }
            });
          `,
        }}
      />
    </div>
  );
}
