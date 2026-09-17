import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def set_table_borders(table, color="CCCCCC", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="none"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def build_insureflow_report():
    doc = Document()

    # Configure Margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    # Styles Setup
    styles = doc.styles
    normal_style = styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(0, 0, 0)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(6)

    def add_p(text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, bold=False, italic=False, size=12, space_before=0, space_after=6, font_name='Times New Roman'):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if text:
            run = p.add_run(text)
            run.bold = bold
            run.italic = italic
            run.font.size = Pt(size)
            run.font.name = font_name
        return p

    def add_bullet(bold_prefix, text, size=12):
        p = doc.add_paragraph(style='List Paragraph')
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        
        run_b = p.add_run(f"• {bold_prefix} ")
        run_b.bold = True
        run_b.font.size = Pt(size)
        run_b.font.name = 'Times New Roman'
        
        run_t = p.add_run(text)
        run_t.font.size = Pt(size)
        run_t.font.name = 'Times New Roman'
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(14)
        run.font.name = 'Times New Roman'
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(13)
        run.font.name = 'Times New Roman'
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(12)
        run.font.name = 'Times New Roman'
        return p

    def add_fig(image_path, caption_text, width=Inches(5.6)):
        if os.path.exists(image_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(8)
            p_img.paragraph_format.space_after = Pt(4)
            run_img = p_img.add_run()
            run_img.add_picture(image_path, width=width)

        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(2)
        p_cap.paragraph_format.space_after = Pt(12)
        run_cap = p_cap.add_run(caption_text)
        run_cap.bold = True
        run_cap.font.size = Pt(11)
        run_cap.font.name = 'Times New Roman'

    def create_custom_table(headers, data, col_widths=None):
        tbl = doc.add_table(rows=len(data) + 1, cols=len(headers))
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(tbl, color="B0BEC5", sz="4")

        # Header Row
        hdr_cells = tbl.rows[0].cells
        for i, h in enumerate(headers):
            hdr_cells[i].text = h
            set_cell_background(hdr_cells[i], "F1F5F9")
            set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.font.bold = True
                run.font.size = Pt(10.5)
                run.font.name = 'Times New Roman'

        # Data Rows
        for r_idx, row_data in enumerate(data):
            row_cells = tbl.rows[r_idx + 1].cells
            bg = "FFFFFF" if r_idx % 2 == 0 else "F8FAFC"
            for c_idx, val in enumerate(row_data):
                row_cells[c_idx].text = str(val)
                set_cell_background(row_cells[c_idx], bg)
                set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=120, right=120)
                p = row_cells[c_idx].paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT if c_idx > 0 or len(str(val)) > 8 else WD_ALIGN_PARAGRAPH.CENTER
                for run in p.runs:
                    run.font.size = Pt(10)
                    run.font.name = 'Times New Roman'

        if col_widths:
            for row in tbl.rows:
                for c_idx, w in enumerate(col_widths):
                    if isinstance(w, docx.shared.Length):
                        row.cells[c_idx].width = w
                    else:
                        row.cells[c_idx].width = Inches(w)

        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_before = Pt(2)
        p_sp.paragraph_format.space_after = Pt(8)
        return tbl

    # ==========================================
    # 1. FRONT MATTER (UP TO TABLE OF CONTENTS)
    # ==========================================
    
    # Title Page Logo
    logo_path = 'extracted_template_media/word/media/image1.jpeg'
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(12)
        p_logo.paragraph_format.space_after = Pt(12)
        p_logo.add_run().add_picture(logo_path, width=Inches(1.8))

    add_p("INSUREFLOW: INSURANCE CLAIM PROCESSING & RISK ASSESSMENT PLATFORM", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=15, space_before=6, space_after=4)
    add_p("A MINI PROJECT REPORT", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=2, space_after=14)
    add_p("Submitted by", align=WD_ALIGN_PARAGRAPH.CENTER, bold=False, size=12, space_before=2, space_after=4)
    add_p("ABISHEK M (727723EUCY003)", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=13, space_before=2, space_after=14)
    add_p("In partial fulfilment for the award of the degree\nof", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=12, space_before=2, space_after=4)
    add_p("BACHELOR OF ENGINEERING\nIN\nCOMPUTER SCIENCE AND ENGINEERING (CYBER SECURITY)", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=13, space_before=2, space_after=14)
    add_p("SRI KRISHNA COLLEGE OF ENGINEERING AND TECHNOLOGY", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=13, space_before=2, space_after=2)
    add_p("An Autonomous Institution | Approved by AICTE | Affiliated to Anna University | Accredited by NAAC with A++ Grade", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=9, space_before=0, space_after=2)
    add_p("Kuniamuthur, Coimbatore – 641008.", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=9, space_before=0, space_after=14)
    add_p("OCTOBER 2026", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=12, space_before=4, space_after=0)

    doc.add_page_break()

    # SUSTAINABLE DEVELOPMENT GOALS
    add_h1("SUSTAINABLE DEVELOPMENT GOALS")
    add_p("The Sustainable Development Goals (SDGs) are a universal call to action adopted by the United Nations in 2015 to end poverty, protect the planet, and ensure that all people enjoy peace and prosperity by 2030. The InsureFlow platform is engineered to directly support sustainable economic development, transparent institutional infrastructure, and reliable digital governance through high-integrity financial operations.", align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    sdg_headers = ["Question", "Answer"]
    sdg_data = [
        ["Which SDGs does the project directly address?", "SDG 8 (Decent Work and Economic Growth), SDG 9 (Industry, Innovation, and Infrastructure), and SDG 16 (Peace, Justice, and Strong Institutions)"],
        ["What strategies or actions are being implemented to achieve these goals?", "By delivering an automated, tamper-resilient, role-governed digital platform for policy underwriting, actuarial risk scoring, and zero-overdraw claims settlement with pessimistic locking."],
        ["How is progress measured and reported in relation to the SDGs?", "Through real-time claims auditability, reduction in fraudulent loss payouts, elimination of concurrency over-disbursements, and instant wire settlement metrics."],
        ["How were these goals identified as relevant to the project's objectives?", "The platform enforces transactional integrity, verifiable underwriting accountability, role-based segregation of duties, and transparent insurance service delivery."],
        ["Are there any partnerships or collaborations in place to enhance this impact?", "Integration with enterprise banking clearance networks, secure underwriting registries, and regulatory compliance standards."]
    ]
    create_custom_table(sdg_headers, sdg_data, [2.5, 4.0])

    doc.add_page_break()

    # BONAFIDE CERTIFICATE
    add_h1("BONAFIDE CERTIFICATE")
    add_p("Certified that this mini project report titled “INSUREFLOW: INSURANCE CLAIM PROCESSING & RISK ASSESSMENT PLATFORM” is the bonafide work of ABISHEK M (727723EUCY003) who carried out the mini project under my supervision.", align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=8, space_after=24)
    
    add_p("Submitted for the Project viva-voce examination held on ____________________", align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=16, space_after=40)

    sig_headers = ["HEAD OF THE DEPARTMENT", "SUPERVISOR"]
    sig_data = [
        [
            "SIGNATURE\n\n\n\nDR. J REJINA PARVIN\nHEAD OF THE DEPARTMENT\nProfessor\nDepartment of CSE (Cyber Security)\nSri Krishna College of Engineering and Technology\nKuniamuthur, Coimbatore–641008.",
            "SIGNATURE\n\n\n\nMR. ANANTRAJ I\nSUPERVISOR\nAsst Professor\nDepartment of CSE (Cyber Security)\nSri Krishna College of Engineering and Technology\nKuniamuthur, Coimbatore–641008."
        ]
    ]
    create_custom_table(sig_headers, sig_data, [3.25, 3.25])

    add_p("INTERNAL EXAMINER                                                                     EXTERNAL EXAMINER", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=11, space_before=40, space_after=0)

    doc.add_page_break()

    # ACKNOWLEDGEMENT
    add_h1("ACKNOWLEDGEMENT")
    add_p("At this juncture, we take the opportunity to convey our sincere thanks and gratitude to the management of Sri Krishna College of Engineering and Technology for providing all the computational and research facilities to us.", space_before=6, space_after=8)
    add_p("We wish to convey our deepest gratitude to our respected Principal, DR. K PORKUMARAN, for encouraging us to undertake innovative project work and offering adequate time and institutional infrastructure to complete our project successfully.", space_before=4, space_after=8)
    add_p("We would like to express our grateful thanks to DR. J REJINA PARVIN, Head of the Department, Department of Computer Science and Engineering (Cyber Security), for her continuous motivation, academic guidance, and valuable advice throughout the development lifecycle of this project.", space_before=4, space_after=8)
    add_p("We extend our heartfelt gratitude to our beloved project guide, MR. ANANTRAJ I, Assistant Professor, Department of Computer Science and Engineering (Cyber Security), for his constant technical support, insightful recommendations, code reviews, and immense guidance at every stage of the project.", space_before=4, space_after=8)
    add_p("Finally, we thank our parents, faculty members, and peers for their continuous moral support and constructive feedback during the realization of the InsureFlow enterprise platform.", space_before=4, space_after=0)

    doc.add_page_break()

    # ABSTRACT
    add_h1("ABSTRACT")
    add_p("In modern insurance administration, legacy manual workflows, fragmented spreadsheet tracking, and disconnected underwriting systems create severe operational bottlenecks, high administrative overhead, and significant exposure to financial loss. In particular, the absence of robust transactional locking mechanisms during concurrent claim settlements frequently results in policy capacity over-disbursements, while manual risk evaluations slow down contract provisioning.", space_before=6, space_after=8)
    add_p("To overcome these critical industry challenges, this project presents InsureFlow, a full-stack enterprise platform engineered to streamline and secure the end-to-end lifecycle of insurance policies, risk evaluations, and claims processing. The platform provides a decoupled, scalable architecture utilizing ReactJS with Redux Toolkit for the modern, component-driven frontend and Spring Boot 3.x with Spring Data JPA and MySQL for the high-performance backend.", space_before=4, space_after=8)
    add_p("InsureFlow establishes strict role-based access control (RBAC) across four specialized stakeholder personas: Policyholders, Underwriters, Claims Adjusters, and Insurance Managers. The platform integrates JSON Web Token (JWT HS256) stateless authentication to protect RESTful endpoints. A core architectural highlight is the implementation of pessimistic database locking (@Lock(LockModeType.PESSIMISTIC_WRITE)) on policy capacity drawdowns, mathematically guaranteeing zero ledger overdraws during concurrent adjudication.", space_before=4, space_after=8)
    add_p("Key capabilities include dynamic policy lifecycle provisioning, multi-parameter actuarial risk scoring (0-100 score mapping to Low, Medium, and High risk tiers), automated loss intake filing, transactional claim adjudication, electronic wire disbursement orchestration, and real-time operational health analytics. The developed system establishes high transactional reliability, end-to-end auditability, and superior user experience.", space_before=4, space_after=0)

    doc.add_page_break()

    # TABLE OF CONTENTS
    add_h1("TABLE OF CONTENTS")
    
    toc_items = [
        ("ACKNOWLEDGEMENT", "iii"),
        ("ABSTRACT", "iv"),
        ("LIST OF TABLES", "vii"),
        ("LIST OF FIGURES", "viii"),
        ("LIST OF ABBREVIATIONS", "ix"),
        ("1  INTRODUCTION", "1"),
        ("    1.1  Overview", "1"),
        ("    1.2  Components of System", "2"),
        ("    1.3  Advanced Technologies", "3"),
        ("    1.4  Global Perspectives", "4"),
        ("2  SYSTEM ANALYSIS", "5"),
        ("    2.1  Existing System", "5"),
        ("    2.1.1  Drawbacks", "6"),
        ("    2.2  Problem Definition", "7"),
        ("    2.3  Proposed System", "8"),
        ("    2.3.1  Advantages", "8"),
        ("3  SYSTEM REQUIREMENTS", "9"),
        ("    3.1  Hardware Requirements", "9"),
        ("    3.2  Software Requirements", "9"),
        ("    3.3  Software Description", "9"),
        ("    3.3.1  Frontend – ReactJS", "10"),
        ("    3.3.2  Backend – Spring Boot & Java", "12"),
        ("4  SYSTEM DESIGN", "14"),
        ("    4.1  Module Description", "14"),
        ("    4.1.1  System Account & Role Management", "14"),
        ("    4.1.2  Policy Underwriting & Lifecycle Module", "15"),
        ("    4.1.3  Risk Assessment & Scoring Engine", "16"),
        ("    4.1.4  Claim Submission & Loss Intake Module", "17"),
        ("    4.1.5  Claim Adjudication & Concurrency Settlement", "18"),
        ("    4.1.6  Disbursement & Wire Transfer Orchestration", "19"),
        ("    4.1.7  Platform Analytics & Health Monitoring", "19"),
        ("    4.2  Use Case Diagram", "20"),
        ("    4.3  Sequence Diagram", "21"),
        ("    4.4  Class Diagram", "22"),
        ("5  TESTING", "23"),
        ("    5.1  Unit Testing", "23"),
        ("    5.2  Integration Testing", "23"),
        ("    5.3  Security and Authentication", "24"),
        ("    5.4  Test Cases", "25"),
        ("    5.4.1  Test Case I: Authentication Failure Handling", "26"),
        ("    5.4.2  Test Case II: Policy Capacity Buffer Validation", "26"),
        ("6  CONCLUSION AND FUTURE WORK", "27"),
        ("    6.1  Conclusion", "27"),
        ("    6.2  Future Work", "27"),
        ("7  APPENDICES", "28"),
        ("    Appendix I – Source Code", "28"),
        ("    Appendix II – Screenshots", "32"),
        ("REFERENCES", "37")
    ]

    for title, page in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        run_t = p.add_run(title)
        run_t.font.name = 'Times New Roman'
        run_t.font.size = Pt(11)
        if not title.startswith("    "):
            run_t.bold = True
        # Add tab spacing and page number
        p.add_run(f"\t{page}")
        p.paragraph_format.tab_stops.add_tab_stop(Inches(6.5), docx.enum.text.WD_TAB_ALIGNMENT.RIGHT, docx.enum.text.WD_TAB_LEADER.DOTS)

    doc.add_page_break()

    # LIST OF TABLES
    add_h1("LIST OF TABLES")
    lot_headers = ["Table No.", "Title", "Page No."]
    lot_data = [
        ["3.1", "Hardware Requirements Specification", "9"],
        ["3.2", "Software Environment Specification", "9"],
        ["4.1.1", "SystemAccount Entity Schema", "14"],
        ["4.1.2", "InsurancePolicy Entity Schema", "15"],
        ["4.1.3", "RiskAssessment Entity Schema", "16"],
        ["4.1.4", "ClaimSubmission Entity Schema", "17"],
        ["4.1.5", "ClaimDisbursement Entity Schema", "18"],
        ["4.1.6", "RESTful API Endpoints Matrix", "19"]
    ]
    create_custom_table(lot_headers, lot_data, [Inches(1.2), Inches(4.3), Inches(1.0)])

    doc.add_page_break()

    # LIST OF FIGURES
    add_h1("LIST OF FIGURES")
    lof_headers = ["Figure No.", "Title", "Page No."]
    lof_data = [
        ["3.1", "InsureFlow Integrated Development & Runtime Stack", "10"],
        ["4.1", "Use Case Diagram", "20"],
        ["4.2", "Sequence Diagram (Claim Adjudication with Pessimistic Lock)", "21"],
        ["4.3", "UML Class Diagram", "22"],
        ["5.1", "Storing the Token in Local Storage and Redux Store", "24"],
        ["5.2", "Authenticating the User using Bearer Token", "24"],
        ["5.3", "Test Case I Execution (Authentication Failure Verification)", "26"],
        ["5.4", "Test Case II Execution (Policy Capacity Buffer Validation)", "26"],
        ["A.2.1", "InsureFlow Platform Landing & Authentication Portal", "32"],
        ["A.2.2", "Policy Provisioning & Underwriting Console", "33"],
        ["A.2.3", "Risk Assessment & Actuarial Scoring Engine", "33"],
        ["A.2.4", "Claim Submission & Loss Intake Portal", "34"],
        ["A.2.5", "Claim Adjudication & Capacity Settlement Console", "34"],
        ["A.2.6", "Financial Disbursement & Wire Transfer Management", "35"],
        ["A.2.7", "Platform Analytics & Real-Time Operational Health", "35"]
    ]
    create_custom_table(lof_headers, lof_data, [Inches(1.2), Inches(4.3), Inches(1.0)])

    doc.add_page_break()

    # LIST OF ABBREVIATIONS
    add_h1("LIST OF ABBREVIATIONS")
    abbr_headers = ["S. No", "Abbreviation", "Expansion"]
    abbr_data = [
        ["1", "JWT", "JSON Web Token"],
        ["2", "REST", "Representational State Transfer"],
        ["3", "API", "Application Programming Interface"],
        ["4", "JPA", "Java Persistence API"],
        ["5", "ORM", "Object Relational Mapping"],
        ["6", "DTO", "Data Transfer Object"],
        ["7", "RBAC", "Role-Based Access Control"],
        ["8", "ACID", "Atomicity, Consistency, Isolation, Durability"],
        ["9", "UI", "User Interface"],
        ["10", "UX", "User Experience"],
        ["11", "SQL", "Structured Query Language"],
        ["12", "HTTP", "Hypertext Transfer Protocol"],
        ["13", "JSON", "JavaScript Object Notation"],
        ["14", "CORS", "Cross-Origin Resource Sharing"],
        ["15", "POJO", "Plain Old Java Object"],
        ["16", "BCrypt", "Blowfish Password Hashing Function"],
        ["17", "RAM", "Random Access Memory"],
        ["18", "UML", "Unified Modelling Language"]
    ]
    create_custom_table(abbr_headers, abbr_data, [Inches(0.8), Inches(1.8), Inches(3.9)])

    doc.add_page_break()

    # ==========================================
    # CHAPTER 1: INTRODUCTION
    # ==========================================
    add_p("CHAPTER 1", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=12, space_after=2)
    add_h1("INTRODUCTION")

    add_h2("1.1 OVERVIEW")
    add_p("The global insurance industry is experiencing a profound paradigm shift driven by digital transformation, high-velocity financial operations, and increasing regulatory compliance mandates. Traditional insurance workflows have historically relied upon manual paper trails, siloed spreadsheet repositories, and fragmented legacy databases. These conventional mechanisms are inherently prone to human error, lengthy claim processing cycles, opaque risk evaluations, and severe vulnerabilities to financial over-disbursement caused by uncoordinated concurrent claims.", space_before=4, space_after=6)
    add_p("InsureFlow is designed and engineered as a modern, high-performance, full-stack enterprise platform to address these systemic inefficiencies. Developed using a robust technology stack featuring ReactJS on the frontend and Spring Boot 3.x on the backend with a relational MySQL database, InsureFlow delivers end-to-end digital automation across the insurance lifecycle. The platform establishes seamless coordination among four core stakeholder personas: Policyholders, Underwriters, Claims Adjusters, and Insurance Managers.", space_before=4, space_after=6)
    add_p("By unifying policy provisioning, algorithmic risk scoring, loss intake notice filing, transactional claim adjudication with pessimistic concurrency locking, and electronic wire disbursement orchestration into a centralized web portal, InsureFlow ensures rigorous financial capacity protection, zero ledger overdraws, transparent audit trails, and exceptional user experience.", space_before=4, space_after=8)

    add_h2("1.2 COMPONENTS OF SYSTEM")
    add_h3("Authentication & Identity Portal")
    add_p("Provides secure, stateless access to the system using BCrypt password hashing and JSON Web Tokens (JWT HS256). It supports user registration, login credential validation, role mapping, and token persistence in the client application.", space_before=2, space_after=4)

    add_h3("Policyholder Self-Service Hub")
    add_p("Enables authenticated policyholders to view their active coverage contracts, examine dynamic remaining capacity limits, file loss intake notices with incident documentation, track adjudication progress in real time, and monitor wire disbursements.", space_before=2, space_after=4)

    add_h3("Underwriting & Contract Provisioning Workspace")
    add_p("Allows licensed underwriters to initialize seed policies (TrialCreationDTO), define financial capping thresholds (maxCoverageLimit), perform actuarial risk assessments (AdverseEventDTO), and transition pending policies into active operational state.", space_before=2, space_after=4)

    add_h3("Claims Adjuster Intake & Verification Module")
    add_p("Equips claims adjusters with an active review backlog queue to inspect filed claims, cross-examine incident dates against policy validity periods, verify loss documentation, and formulate adjudication recommendations.", space_before=2, space_after=4)

    add_h3("Insurance Manager Adjudication Console")
    add_p("Serves as the executive governance hub for approving or rejecting claims. The console executes transactional pessimistic database write locks on policy entities to deduct approved payouts directly from the remaining financial limit without race conditions.", space_before=2, space_after=4)

    add_h3("Financial Disbursement & Wire Transfer Engine")
    add_p("Manages the lifecycle of settlement payouts from SCHEDULED to PROCESSING and COMPLETED, capturing bank routing numbers, recipient account numbers, transaction hashes, and precise execution timestamps.", space_before=2, space_after=4)

    add_h3("Platform Analytics & Operational Health Dashboard")
    add_p("Aggregates real-time business intelligence metrics including active contract counts, total capacity exposure, pending claims backlog, settled disbursement volumes, and actuarial loss ratios across the enterprise.", space_before=2, space_after=8)

    add_h2("1.3 ADVANCED TECHNOLOGIES")
    add_h3("JWT HS256 Stateless Token Authentication")
    add_p("Eliminates server-side session overhead by issuing digitally signed JSON Web Tokens containing user identities and authorized role authorities, validated on every HTTP request via a custom Spring Security filter.", space_before=2, space_after=4)

    add_h3("Pessimistic Write Concurrency Locking (@Lock)")
    add_p("Guarantees strict ACID transactional isolation during claim adjudication. By acquiring an exclusive database row-level lock on the target InsurancePolicy entity, concurrent settlements are serialized, mathematically preventing financial overdraws.", space_before=2, space_after=4)

    add_h3("Spring Data JPA & Custom JPQL Reflections")
    add_p("Leverages Hibernate Object-Relational Mapping to execute high-efficiency database queries, derived repository methods (findByPolicy_Account_Id), and custom JPQL queries for active backlog tracking.", space_before=2, space_after=4)

    add_h3("Redux Toolkit & Centralized State Management")
    add_p("Provides predictable, centralized application state in the React client, orchestrating asynchronous Axios API calls, authentication tokens, and cached policy/claim datasets with immutable update patterns.", space_before=2, space_after=4)

    add_h3("Swagger / OpenAPI 3.0 Documentation")
    add_p("Generates interactive, standardized REST API specifications, allowing developers and external auditing services to inspect request schemas, status codes, and security requirements seamlessly.", space_before=2, space_after=8)

    add_h2("1.4 GLOBAL PERSPECTIVES")
    add_p("Global financial and insurance institutions are rapidly embracing InsurTech solutions to meet evolving regulatory frameworks such as Solvency II and IFRS 17. The transition toward real-time automated adjudication platforms is driven by several key global trends:", space_before=4, space_after=6)
    add_bullet("Transition from Legacy Mainframes to Cloud Microservices:", "Global insurers are modernizing monolithic mainframes into modular, API-first architectures built on Spring Boot and React to achieve elastic scalability and rapid deployment.")
    add_bullet("Rigorous Risk Governance & Fraud Prevention:", "International insurance standards require verifiable underwriting scoring and strict role-based segregation of duties between adjusters and financial approvers.")
    add_bullet("Consumer Expectations for Instant Claims Settlement:", "Digital-native policyholders demand transparent, mobile-responsive self-service portals with real-time status tracking and rapid automated wire disbursements.")
    add_bullet("Resilience Against Concurrency Faults:", "High-frequency digital transaction volumes require enterprise backends equipped with pessimistic database locking to eliminate race conditions and financial leakage.")

    doc.add_page_break()

    # ==========================================
    # CHAPTER 2: SYSTEM ANALYSIS
    # ==========================================
    add_p("CHAPTER 2", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=12, space_after=2)
    add_h1("SYSTEM ANALYSIS")

    add_h2("2.1 EXISTING SYSTEM")
    add_p("In conventional insurance operations, policy administration and claims handling are predominantly managed through disconnected legacy software, paper-based incident forms, and manually updated spreadsheets. When a policyholder suffers an insured loss, they must submit physical claim documentation or unformatted email notices. Adjusters manually retrieve policy terms from archives, calculate risk exposure, and verify remaining coverage limits using static ledger entries.", space_before=4, space_after=6)
    add_p("This disconnected workflow lacks centralized database synchronization, leading to extreme delays—often taking weeks or months to adjudicate a single claim. Crucially, existing legacy systems do not implement database concurrency controls. If multiple adjusters process separate claims against the same policy concurrently, both claims may be approved simultaneously based on outdated remaining limit values, resulting in severe financial loss and capacity overdraw.", space_before=4, space_after=8)

    add_h3("2.1.1 DRAWBACKS")
    add_bullet("High Claim Processing Latency:", "Manual paper verification and manual approval routing lead to substantial processing bottlenecks and client dissatisfaction.")
    add_bullet("Absence of Concurrency Control:", "Lack of row-level pessimistic database locks enables race conditions, allowing concurrent claims to exceed the total policy coverage limit.")
    add_bullet("Subjective Risk Evaluation:", "Without standardized actuarial scoring algorithms, risk assessment remains inconsistent across different underwriters.")
    add_bullet("Vulnerable Authentication & Data Security:", "Legacy tools frequently use plaintext credentials or weak session identifiers without granular role-based endpoint protection.")
    add_bullet("Disconnected Disbursement Operations:", "Manual preparation of wire transfers results in typographical errors in account numbers and untracked financial transactions.")
    add_bullet("Lack of Real-Time Analytics:", "Executive management lacks visibility into platform-wide financial exposure, review backlogs, and loss ratios.")

    add_h2("2.2 PROBLEM DEFINITION")
    add_p("The primary problem addressed by this project is the vulnerability, inefficiency, and lack of transparency inherent in legacy insurance claims workflows. Specifically, the system resolves:", space_before=4, space_after=6)
    add_bullet("Ledger Over-Disbursement Vulnerability:", "Eliminating concurrent financial race conditions where multiple claims drain more capital than a contract's allocated capacity.")
    add_bullet("Unauthorized Lifecycle Actions:", "Preventing unauthorized actors from activating policies, modifying risk scores, or initiating wire disbursements without authenticated role credentials.")
    add_bullet("Fragmented Stakeholder Workflows:", "Eliminating siloed communication between policyholders, underwriters, adjusters, and managers by providing tailored role-based portals.")
    add_bullet("Data Inconsistency & Unvalidated Claims:", "Preventing invalid claims with future incident dates, inactive policy links, or missing underwriting audit records from entering the core ledger.")

    add_h2("2.3 PROPOSED SYSTEM")
    add_p("InsureFlow introduces a full-stack, enterprise-grade digital ecosystem that automates and secures the complete insurance policy and claims lifecycle. The proposed system features:", space_before=4, space_after=6)
    add_bullet("Centralized Role-Based Architecture:", "Four distinct stakeholder roles (POLICYHOLDER, UNDERWRITER, CLAIMS_ADJUSTER, INSURANCE_MANAGER) with strict method-level and endpoint-level authorization.")
    add_bullet("Stateless JWT HS256 Security:", "All API transactions are authenticated using cryptographically signed JSON Web Tokens, ensuring secure, tamper-proof communications.")
    add_bullet("Algorithmic Risk Scoring Engine:", "Underwriters compute a quantitative risk score (0-100) based on medical history and occupational hazards, automatically classifying contracts into LOW, MEDIUM, or HIGH risk tiers.")
    add_bullet("Pessimistic Locking Concurrency Guard:", "Adjudication operations execute within Spring @Transactional boundaries utilizing @Lock(LockModeType.PESSIMISTIC_WRITE), guaranteeing atomic limit deductions.")
    add_bullet("Automated Wire Settlement Pipeline:", "Approved claims automatically generate structured ClaimDisbursement entities with bank routing details, transitioning safely through execution states.")
    add_bullet("Real-Time Analytics & Monitoring:", "Executive dashboards display live counts of active contracts, loss backlog queues, and total settled payouts.")

    add_h3("2.3.1 ADVANTAGES")
    add_bullet("Zero Over-Disbursement Guarantee:", "Strict transactional database row locking ensures financial limits are nunca overdrawn under any concurrency load.")
    add_bullet("Rapid Claims Turnaround:", "Digital loss filing and automated workflow queues reduce claim resolution times from weeks to minutes.")
    add_bullet("Granular Security & Compliance:", "Spring Security and JWT validation safeguard sensitive financial data against unauthorized access.")
    add_bullet("Comprehensive Auditability:", "Every policy status transition, risk evaluation, claim adjudication, and wire disbursement is immutably timestamped and linked to specific user accounts.")
    add_bullet("Intuitive Responsive User Experience:", "ReactJS frontend with modern visual cues, capacity progress bars, and reactive state updates ensures optimal usability across devices.")

    doc.add_page_break()

    # ==========================================
    # CHAPTER 3: SYSTEM REQUIREMENTS
    # ==========================================
    add_p("CHAPTER 3", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=12, space_after=2)
    add_h1("SYSTEM REQUIREMENTS")
    add_p("The hardware, software, and development environment requirements necessary to build, deploy, and operate the InsureFlow platform are detailed in the following sections.", space_before=4, space_after=6)

    add_h2("3.1 HARDWARE REQUIREMENTS")
    hw_headers = ["S. No", "Hardware Component", "Minimum Requirement", "Recommended Specification"]
    hw_data = [
        ["1", "Processor (CPU)", "Intel Core i3 / AMD Ryzen 3 (2.0 GHz)", "Intel Core i5/i7 / AMD Ryzen 5/7 (3.2+ GHz)"],
        ["2", "System Memory (RAM)", "8 GB DDR4", "16 GB DDR4/DDR5 Dual-Channel"],
        ["3", "Storage (Disk)", "20 GB available SSD space", "512 GB NVMe M.2 Solid State Drive"],
        ["4", "Network Interface", "Standard Broadband (10 Mbps)", "High-Speed Gigabit LAN / 100 Mbps WAN"],
        ["5", "Display Resolution", "1366 x 768 pixels", "1920 x 1080 Full HD or higher"]
    ]
    create_custom_table(hw_headers, hw_data, [Inches(0.8), Inches(1.8), Inches(2.0), Inches(1.9)])

    add_h2("3.2 SOFTWARE REQUIREMENTS")
    sw_headers = ["S. No", "Software Component", "Platform / Tool", "Version"]
    sw_data = [
        ["1", "Operating System", "Microsoft Windows / Linux (Ubuntu) / macOS", "Windows 11 (64-bit) / Ubuntu 22.04 LTS"],
        ["2", "Frontend Framework", "ReactJS with Redux Toolkit & React Router", "React 18.2.0, Redux Toolkit 1.9.5"],
        ["3", "Backend Framework", "Java Development Kit & Spring Boot", "JDK 17 LTS, Spring Boot 3.1.x"],
        ["4", "Database Engine", "MySQL Relational Database Server", "MySQL Community Server 8.0.x"],
        ["5", "Security & Auth", "Spring Security & Java JWT (JJWT)", "Spring Security 6.x, JJWT 0.11.5"],
        ["6", "Source Code Editor / IDE", "Visual Studio Code / IntelliJ IDEA Ultimate", "VS Code 1.90+ / IntelliJ 2024.x"],
        ["7", "Build Tools & Runtime", "Apache Maven & Node Package Manager", "Maven 3.9.x, Node.js 18.x (npm 9.x)"]
    ]
    create_custom_table(sw_headers, sw_data, [Inches(0.8), Inches(1.8), Inches(2.3), Inches(1.6)])

    add_h2("3.3 SOFTWARE DESCRIPTION")
    add_fig('assets/fig_3_1_vscode.png', "Fig. 3.1. InsureFlow Integrated Development & Runtime Stack", width=Inches(5.4))
    
    add_h3("3.3.1 FRONTEND – ReactJS & Redux Toolkit")
    add_p("ReactJS is an open-source, component-driven JavaScript library maintained by Meta, designed for creating declarative, dynamic, and responsive user interfaces for Single Page Applications (SPAs). React simplifies UI development by breaking down complex screens into isolated, modular, and reusable components that manage their own local state and lifecycle.", space_before=4, space_after=6)
    add_p("Key architectural characteristics of the InsureFlow React frontend include:", space_before=4, space_after=4)
    add_bullet("Virtual DOM Architecture:", "React maintains an in-memory Virtual Document Object Model. When application state changes, React's reconciliation diffing algorithm computes minimal DOM mutations, ensuring fast rendering performance and seamless UI responsiveness.")
    add_bullet("Declarative JSX Syntax:", "JSX allows developers to combine HTML structure with JavaScript logic cleanly, enhancing readability, code maintainability, and rapid UI development.")
    add_bullet("Redux Toolkit Centralized State:", "Manages global application state (authentication tokens, active user roles, cached policies, claims queues) with predictable reducers and asynchronous thunk dispatches.")
    add_bullet("Axios HTTP Client & Interceptors:", "Axios handles HTTP requests, automatically injecting the JWT Bearer token into request authorization headers and gracefully intercepting 401/403 security errors.")
    add_bullet("Modular Component Hierarchy:", "The frontend code is structured into dedicated domain directories: components/assessments, components/claims, components/common (CapacityBar, EmptyState), components/dashboard (DomainChart, StatCards), components/disbursements, and components/layout.")

    add_h3("3.3.2 BACKEND – Spring Boot 3.x, Java 17 & MySQL")
    add_p("Spring Boot 3.x is an enterprise-grade Java application framework built on top of the Spring Framework, designed to simplify the configuration, bootstrapping, and deployment of production-ready RESTful web microservices. Coupled with Java 17 LTS, Spring Boot provides enhanced performance, strong type safety, memory efficiency, and modern language features such as records and pattern matching.", space_before=4, space_after=6)
    add_p("Core backend dependencies and architectural modules include:", space_before=4, space_after=4)
    add_bullet("Spring Web (REST Controllers):", "Exposes RESTful API endpoints, handles JSON serialization/deserialization via Jackson, and executes request parameter validation via Hibernate Validator.")
    add_bullet("Spring Data JPA & Hibernate:", "Implements the Data Access Object (DAO) pattern using Spring Data repositories, eliminating boilerplate SQL queries while supporting custom JPQL statements and pessimistic row-level locking.")
    add_bullet("Spring Security & JJWT:", "Enforces stateless, token-based authentication and role-based method security (@PreAuthorize). It intercepts every HTTP request through JwtAuthFilter, decrypts the HS256 signature, and populates the SecurityContextHolder.")
    add_bullet("MySQL Connector/J Database:", "Provides enterprise-grade ACID compliant relational data storage with foreign key constraints, unique indexes on policy and claim numbers, and scalable connection pooling via HikariCP.")
    add_bullet("Project Lombok:", "Reduces boilerplate Java code through annotations such as @Data, @NoArgsConstructor, @AllArgsConstructor, and @Builder, automatically generating getters, setters, and constructors.")

    doc.add_page_break()

    # ==========================================
    # CHAPTER 4: SYSTEM DESIGN
    # ==========================================
    add_p("CHAPTER 4", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=12, space_after=2)
    add_h1("SYSTEM DESIGN")

    add_h2("4.1 MODULE DESCRIPTION")
    add_p("The InsureFlow enterprise architecture is decomposed into seven cohesive, specialized functional modules that orchestrate the entire insurance lifecycle:", space_before=4, space_after=6)

    # 4.1.1 User & Auth Module
    add_h3("4.1.1 System Account & Authentication Module")
    add_p("This module manages user registration, identity authentication, credential hashing, and role authorization. Passwords are encrypted using BCrypt before persistence in the system_account table. Upon successful login, the system generates an HS256-signed JWT token containing the user's email and role, returning an AuthResponseDTO to the client.", space_before=2, space_after=4)
    
    add_p("Table 4.1.1 SystemAccount Entity Schema", bold=True, size=11, space_before=4, space_after=2)
    acc_headers = ["Field Name", "Data Type", "Constraint", "Description"]
    acc_data = [
        ["id", "Long", "PRIMARY KEY, AUTO_INCREMENT", "Unique internal account identifier"],
        ["email", "String (varchar 255)", "UNIQUE, NOT NULL, VALID_EMAIL", "User login email address and unique identity handle"],
        ["passwordHash", "String (varchar 255)", "NOT NULL", "BCrypt salted cryptographic password hash"],
        ["fullName", "String (varchar 255)", "NOT NULL", "Legal full name of the registered user"],
        ["role", "String (varchar 50)", "NOT NULL, ENUM_VAL", "Access role: POLICYHOLDER, UNDERWRITER, CLAIMS_ADJUSTER, INSURANCE_MANAGER"],
        ["isActive", "Boolean", "NOT NULL, DEFAULT TRUE", "Account active flag for instant deactivation capability"],
        ["createdAt", "LocalDateTime", "NOT NULL", "Timestamp of account registration"]
    ]
    create_custom_table(acc_headers, acc_data, [Inches(1.2), Inches(1.4), Inches(1.8), Inches(2.1)])

    # 4.1.2 Policy Underwriting Module
    add_h3("4.1.2 Policy Underwriting & Lifecycle Module")
    add_p("Governs the creation, validation, activation, and deletion of insurance policies. Underwriters initialize draft policies with unique policy numbers (matching pattern POL-XXXXXX), premium amounts, and absolute coverage limits. A policy begins in PENDING status and can only be transitioned to ACTIVE once an underwriting risk assessment is successfully executed.", space_before=2, space_after=4)

    add_p("Table 4.1.2 InsurancePolicy Entity Schema", bold=True, size=11, space_before=4, space_after=2)
    pol_headers = ["Field Name", "Data Type", "Constraint", "Description"]
    pol_data = [
        ["id", "Long", "PRIMARY KEY, AUTO_INCREMENT", "Unique internal policy record identifier"],
        ["policyNumber", "String (varchar 50)", "UNIQUE, NOT NULL, PATTERN 'POL-XXXXXX'", "Business policy identifier used on all contracts"],
        ["account_id", "Long (FK)", "FOREIGN KEY -> SystemAccount", "Many-to-One relationship to target policyholder"],
        ["coverageType", "String (varchar 100)", "NOT NULL", "Category of insurance coverage (e.g., Property, Health, Auto)"],
        ["premiumAmount", "BigDecimal", "NOT NULL, NUMERICAL_SCALE", "Base premium cost assessed for the contract duration"],
        ["maxCoverageLimit", "BigDecimal", "NOT NULL, POSITIVE", "Absolute financial capacity capping limit of the policy"],
        ["remainingLimit", "BigDecimal", "NOT NULL, >= 0", "Dynamic remaining capacity buffer available for claims"],
        ["policyStatus", "String (varchar 30)", "NOT NULL, ENUM", "Status: PENDING, ACTIVE, EXPIRED, CANCELLED"],
        ["effectiveDate", "LocalDate", "NOT NULL", "Contract commencement date"],
        ["expiryDate", "LocalDate", "NOT NULL", "Contract termination and expiration date"]
    ]
    create_custom_table(pol_headers, pol_data, [Inches(1.2), Inches(1.4), Inches(1.8), Inches(2.1)])

    # 4.1.3 Risk Assessment Module
    add_h3("4.1.3 Risk Assessment & Actuarial Scoring Engine")
    add_p("Evaluates the underlying hazard profile of insured assets or individuals. Underwriters input actuarial metrics, medical history flags, and occupational hazard indicators. The scoring engine calculates a standardized risk score (0-100) and assigns a risk tier (LOW for 0-35, MEDIUM for 36-70, HIGH for 71-100), recording detailed underwriting rationale notes.", space_before=2, space_after=4)

    add_p("Table 4.1.3 RiskAssessment Entity Schema", bold=True, size=11, space_before=4, space_after=2)
    risk_headers = ["Field Name", "Data Type", "Constraint", "Description"]
    risk_data = [
        ["id", "Long", "PRIMARY KEY, AUTO_INCREMENT", "Unique internal risk assessment audit identifier"],
        ["policy_id", "Long (FK)", "FOREIGN KEY -> InsurancePolicy", "Many-to-One mapping to evaluated coverage contract"],
        ["assessor_id", "Long (FK)", "FOREIGN KEY -> SystemAccount", "Many-to-One mapping to licensed underwriter"],
        ["riskScore", "Integer", "NOT NULL, RANGE 0-100", "Calculated quantitative risk score"],
        ["riskTier", "String (varchar 20)", "NOT NULL, ENUM 'LOW','MEDIUM','HIGH'", "Categorical risk classification tier"],
        ["medicalHistoryFlag", "Boolean", "NOT NULL", "Indicator of pre-existing health or structural hazards"],
        ["occupationalHazardFlag", "Boolean", "NOT NULL", "Indicator of hazardous professional exposure"],
        ["underwritingNotes", "String (text)", "NOT NULL", "Detailed underwriting rationale notes"]
    ]
    create_custom_table(risk_headers, risk_data, [Inches(1.2), Inches(1.4), Inches(1.8), Inches(2.1)])

    # 4.1.4 Claim Submission Module
    add_h3("4.1.4 Claim Submission & Loss Intake Module")
    add_p("Allows authenticated policyholders to report loss events by submitting claim notices (EnrollmentRequestDTO). The backend validates that the target policy is currently ACTIVE, that the incidentDate is not in the future and falls within the policy's effective period, and that requestedPayout does not exceed the policy's maxCoverageLimit.", space_before=2, space_after=4)

    add_p("Table 4.1.4 ClaimSubmission Entity Schema", bold=True, size=11, space_before=4, space_after=2)
    clm_headers = ["Field Name", "Data Type", "Constraint", "Description"]
    clm_data = [
        ["id", "Long", "PRIMARY KEY, AUTO_INCREMENT", "Unique internal claim intake identifier"],
        ["claimNumber", "String (varchar 50)", "UNIQUE, NOT NULL, PATTERN 'CLM-XXXX'", "Unique claim tracking identifier"],
        ["policy_id", "Long (FK)", "FOREIGN KEY -> InsurancePolicy", "Many-to-One mapping to insured policy contract"],
        ["claimant_id", "Long (FK)", "FOREIGN KEY -> SystemAccount", "Many-to-One mapping to claimant policyholder"],
        ["incidentDate", "LocalDate", "NOT NULL, PAST_OR_PRESENT", "Date of occurrence of the insured loss event"],
        ["incidentDescription", "String (text)", "NOT NULL", "Detailed loss narrative and verification references"],
        ["requestedPayout", "BigDecimal", "NOT NULL, POSITIVE", "Financial capital requested by the claimant"],
        ["approvedPayout", "BigDecimal", "NULLABLE, >= 0", "Final capital payout approved by manager"],
        ["claimStatus", "String (varchar 30)", "NOT NULL, ENUM", "Status: SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED"]
    ]
    create_custom_table(clm_headers, clm_data, [Inches(1.2), Inches(1.4), Inches(1.8), Inches(2.1)])

    # 4.1.5 Claim Adjudication & Concurrency Module
    add_h3("4.1.5 Claim Adjudication & Concurrency Settlement Module")
    add_p("The adjudication module handles formal manager decisions on pending claims. To eliminate race conditions during concurrent claim approvals, the service executes findByIdWithPessimisticWrite() annotated with @Lock(LockModeType.PESSIMISTIC_WRITE). The database locks the policy row until the transaction completes, validating that remainingLimit >= approvedPayout, deducting the payout atomically, and updating the claim status.", space_before=2, space_after=4)

    # 4.1.6 Disbursement Module
    add_h3("4.1.6 Disbursement & Wire Transfer Orchestration")
    add_p("Once a claim is approved, a ClaimDisbursement record is automatically created in SCHEDULED status. The manager initiates electronic settlement execution, validating bank routing numbers and account tokens before transitioning the wire status to COMPLETED.", space_before=2, space_after=4)

    add_p("Table 4.1.5 ClaimDisbursement Entity Schema", bold=True, size=11, space_before=4, space_after=2)
    disb_headers = ["Field Name", "Data Type", "Constraint", "Description"]
    disb_data = [
        ["id", "Long", "PRIMARY KEY, AUTO_INCREMENT", "Unique internal disbursement transaction ID"],
        ["claim_id", "Long (FK)", "ONE-TO-ONE -> ClaimSubmission", "Direct mapping to the approved insurance claim"],
        ["disbursementAmount", "BigDecimal", "NOT NULL, POSITIVE", "Exact settled financial wire sum"],
        ["bankRoutingNumber", "String (varchar 50)", "NOT NULL", "Automated Clearing House (ACH) bank routing identifier"],
        ["bankAccountNumber", "String (varchar 50)", "NOT NULL", "Destination bank account number"],
        ["executionStatus", "String (varchar 30)", "NOT NULL, ENUM", "Status: SCHEDULED, PROCESSING, COMPLETED, FAILED"],
        ["disbursementDate", "LocalDateTime", "NULLABLE", "Timestamp of completed electronic wire execution"]
    ]
    create_custom_table(disb_headers, disb_data, [Inches(1.2), Inches(1.4), Inches(1.8), Inches(2.1)])

    # 4.1.7 Platform Analytics & Endpoints Matrix
    add_h3("4.1.7 Platform Analytics & RESTful API Endpoints Matrix")
    add_p("The platform analytics service aggregates system-wide operational indicators including active policy counts, pending review backlog queues, and total settled financial payouts. All functionalities are exposed via specialized REST API endpoints:", space_before=2, space_after=4)

    add_p("Table 4.1.6 RESTful API Endpoints Matrix", bold=True, size=11, space_before=4, space_after=2)
    api_headers = ["HTTP Method", "Endpoint URI", "Authorized Roles", "HTTP Status", "Description"]
    api_data = [
        ["POST", "/api/v1/auth/login", "Public Access", "200 OK", "User authentication & JWT token generation"],
        ["POST", "/api/v1/auth/register", "Public Access", "201 Created", "Register new policyholder or underwriter identity"],
        ["POST", "/api/v1/policies", "UNDERWRITER, MANAGER", "201 Created", "Provision new policy entry (TrialCreationDTO)"],
        ["GET", "/api/v1/policies", "UNDERWRITER, MANAGER", "200 OK", "Retrieve all ledger policies for staff review"],
        ["GET", "/api/v1/policies/my-policies", "POLICYHOLDER", "200 OK", "Retrieve active policies of logged-in claimant"],
        ["PATCH", "/api/v1/policies/{id}/activate", "UNDERWRITER, MANAGER", "200 OK", "Transition policy status from PENDING to ACTIVE"],
        ["DELETE", "/api/v1/policies/{id}", "UNDERWRITER, MANAGER", "204 No Content", "Irrevocably purge a policy from core ledger"],
        ["POST", "/api/v1/claims", "POLICYHOLDER", "201 Created", "File a new claim notice (EnrollmentRequestDTO)"],
        ["GET", "/api/v1/claims", "UNDERWRITER, MANAGER, ADJUSTER", "200 OK", "Retrieve all submitted loss notices in backlog"],
        ["GET", "/api/v1/claims/my-claims", "POLICYHOLDER", "200 OK", "Retrieve claims filed by authenticated user"],
        ["PATCH", "/api/v1/claims/{id}/adjudicate", "INSURANCE_MANAGER", "200 OK", "Adjudicate claim with Pessimistic Write lock"],
        ["DELETE", "/api/v1/claims/{id}", "POLICYHOLDER, MANAGER", "204 No Content", "Remove claim notice from registry"],
        ["POST", "/api/v1/assessments", "UNDERWRITER, MANAGER", "201 Created", "Execute actuarial risk evaluation"],
        ["GET", "/api/v1/assessments/policy/{id}", "UNDERWRITER, MANAGER", "200 OK", "Retrieve all risk audit profiles for policy"],
        ["GET", "/api/v1/disbursements", "MANAGER, ADJUSTER", "200 OK", "Retrieve all scheduled & completed wire logs"],
        ["POST", "/api/v1/disbursements/{id}/execute", "INSURANCE_MANAGER", "200 OK", "Execute automated bank wire transfer"],
        ["GET", "/api/v1/analytics/metrics", "MANAGER, UNDERWRITER, ADJUSTER", "200 OK", "Aggregate system-wide platform health metrics"]
    ]
    create_custom_table(api_headers, api_data, [Inches(0.9), Inches(1.8), Inches(1.5), Inches(0.9), Inches(1.4)])

    doc.add_page_break()

    # 4.2 Use Case Diagram
    add_h2("4.2 USE CASE DIAGRAM")
    add_p("A Use Case Diagram in Unified Modeling Language (UML) depicts the functional interactions between external human actors (Policyholder, Underwriter, Claims Adjuster, Insurance Manager) and the InsureFlow system boundary.", space_before=4, space_after=6)
    add_fig('assets/fig_4_1_usecase.png', "Fig. 4.1. InsureFlow UML Use Case Diagram", width=Inches(5.6))

    doc.add_page_break()

    # 4.3 Sequence Diagram
    add_h2("4.3 SEQUENCE DIAGRAM")
    add_p("The Sequence Diagram illustrates the dynamic time-ordered message exchange between system objects during the Claim Adjudication and Capacity Settlement workflow, highlighting the acquisition of the pessimistic row lock (@Lock(LockModeType.PESSIMISTIC_WRITE)) on the database.", space_before=4, space_after=6)
    add_fig('assets/fig_4_2_sequence.png', "Fig. 4.2. Sequence Diagram (Claim Adjudication with Pessimistic Locking)", width=Inches(5.6))

    doc.add_page_break()

    # 4.4 Class Diagram
    add_h2("4.4 CLASS DIAGRAM")
    add_p("The Class Diagram defines the static object-oriented structure of the InsureFlow domain model, specifying attributes, visibility modifiers, methods, and entity relationships (One-to-Many, Many-to-One, One-to-One).", space_before=4, space_after=6)
    add_fig('assets/fig_4_3_class_diagram.png', "Fig. 4.3. InsureFlow UML Class Diagram", width=Inches(5.8))

    doc.add_page_break()

    # ==========================================
    # CHAPTER 5: TESTING
    # ==========================================
    add_p("CHAPTER 5", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=12, space_after=2)
    add_h1("TESTING")

    add_h2("5.1 UNIT TESTING")
    add_p("Unit testing forms the primary verification tier in the InsureFlow software quality assurance lifecycle. Individual backend service classes (AuthService, PolicyUnderwritingService, ClaimProcessingService, DisbursementOrchestrationService) and entity business logic methods were isolated and tested using JUnit 5 and Mockito. On the frontend, React components and Redux state reducers were validated using Jest and Axios Mock Adapter to verify proper state transitions and exception handling in isolation.", space_before=4, space_after=6)

    add_h2("5.2 INTEGRATION TESTING")
    add_p("Integration testing verifies the harmonious communication and contract compliance between the React SPA client, Spring Boot REST controllers, and the MySQL database engine. Using Spring Boot's @SpringBootTest and MockMvc test framework, HTTP request payloads were serialized, dispatched across security filter chains, and validated against database records, ensuring end-to-end transactional consistency.", space_before=4, space_after=6)

    add_h2("5.3 SECURITY AND AUTHENTICATION TESTING")
    add_p("Security testing ensures that protected resources cannot be accessed without valid, cryptographically verified credentials. JSON Web Tokens (JWT) signed with the HMAC-SHA256 (HS256) algorithm were subjected to token expiration, signature tampering, and unauthorized role elevation tests.", space_before=4, space_after=6)

    add_fig('assets/fig_5_1_jwt_storage.png', "Fig. 5.1. Storing the Token in Local Storage and Redux Store", width=Inches(5.2))
    add_fig('assets/fig_5_2_jwt_auth.png', "Fig. 5.2. Authenticating the User using Bearer Token in JwtAuthFilter", width=Inches(5.2))

    add_h2("5.4 TEST CASES")
    add_p("Standardized test cases were executed to formally validate system requirements, constraint boundaries, and error recovery mechanisms.", space_before=4, space_after=6)

    add_h3("5.4.1 TEST CASE I: Authentication Failure Handling")
    add_p("Scenario: User attempts to authenticate by supplying invalid or mismatched password credentials to the login endpoint.", space_before=2, space_after=2)
    add_p("Expected Output: Authentication fails; backend returns HTTP 401 Unauthorized with error message 'Invalid email or password / Bad credentials'. No JWT token is issued.", space_before=2, space_after=2)
    add_p("Actual Output: The system prevents login, denies token creation, and alerts the user with 'Invalid email or password'.", space_before=2, space_after=4)
    add_fig('assets/fig_5_3_test_case_1.png', "Fig. 5.3. Test Case I Execution", width=Inches(5.0))

    add_h3("5.4.2 TEST CASE II: Policy Capacity Buffer Validation")
    add_p("Scenario: A claim is submitted with a requested payout amount that exceeds the policy's remaining capacity limit ($75,000 requested vs $50,000 remaining).", space_before=2, space_after=2)
    add_p("Expected Output: The system throws BusinessValidationException and returns HTTP 400 Bad Request with error: 'Requested payout exceeds dynamic policy capacity buffer'.", space_before=2, space_after=2)
    add_p("Actual Output: The system rejects the claim submission, preserving the ledger balance and preventing capacity overdraw.", space_before=2, space_after=4)
    add_fig('assets/fig_5_4_test_case_2.png', "Fig. 5.4. Test Case II Execution", width=Inches(5.0))

    doc.add_page_break()

    # ==========================================
    # CHAPTER 6: CONCLUSION & FUTURE WORK
    # ==========================================
    add_p("CHAPTER 6", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=12, space_after=2)
    add_h1("CONCLUSION AND FUTURE WORK")

    add_h2("6.1 CONCLUSION")
    add_p("The InsureFlow Insurance Claim Processing and Risk Assessment Platform successfully addresses the operational bottlenecks, security vulnerabilities, and concurrency over-disbursement risks prevalent in legacy insurance software. By combining a modern, reactive ReactJS user interface with a high-performance Spring Boot 3.x and MySQL backend, the platform delivers an automated, transparent, and resilient digital ecosystem.", space_before=4, space_after=6)
    add_p("The implementation of pessimistic database write locks (@Lock(LockModeType.PESSIMISTIC_WRITE)) guarantees mathematical protection against concurrent claim over-disbursements. Granular role-based access control with JWT HS256 authentication ensures strict segregation of duties between policyholders, underwriters, adjusters, and managers. In conclusion, InsureFlow establishes a highly scalable, audit-compliant, and dependable digital foundation for modern enterprise insurance operations.", space_before=4, space_after=8)

    add_h2("6.2 FUTURE WORK")
    add_bullet("1. AI/ML Automated Fraud Detection & Computer Vision:", "Integrating convolutional neural networks (CNNs) to analyze uploaded accident and property damage images, detecting digital tampering and auto-scoring loss severity.")
    add_bullet("2. Smart Contract Blockchain Settlement:", "Deploying Ethereum/Hyperledger smart contracts to execute automated parametric insurance claims without manual human intervention upon verified trigger events.")
    add_bullet("3. Native Mobile Application (React Native):", "Developing iOS and Android mobile clients equipped with GPS incident tagging and push notifications for instantaneous loss reporting.")
    add_bullet("4. Real-Time Telematics & IoT Integration:", "Connecting IoT vehicle sensors and wearable health trackers for continuous dynamic risk recalculations and usage-based insurance (UBI) premiums.")

    doc.add_page_break()

    # ==========================================
    # CHAPTER 7: APPENDICES
    # ==========================================
    add_p("CHAPTER 7", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_before=12, space_after=2)
    add_h1("APPENDICES")

    add_h2("APPENDIX I – SOURCE CODE")

    def add_code_block(filename, code_text):
        add_h3(filename)
        p_box = doc.add_paragraph()
        p_box.paragraph_format.space_before = Pt(2)
        p_box.paragraph_format.space_after = Pt(8)
        p_box.paragraph_format.line_spacing = 1.0
        
        # Add border around code block via custom XML
        pPr = p_box._p.get_or_add_pPr()
        pBdr = parse_xml(f'''
            <w:pBdr {nsdecls("w")}>
                <w:top w:val="single" w:sz="4" w:space="4" w:color="CBD5E1"/>
                <w:left w:val="single" w:sz="12" w:space="8" w:color="3B82F6"/>
                <w:bottom w:val="single" w:sz="4" w:space="4" w:color="CBD5E1"/>
                <w:right w:val="single" w:sz="4" w:space="4" w:color="CBD5E1"/>
            </w:pBdr>
        ''')
        pPr.append(pBdr)
        
        run = p_box.add_run(code_text)
        run.font.name = 'Courier New'
        run.font.size = Pt(8.5)
        run.font.color.rgb = RGBColor(30, 41, 59)

    code_policy = """package com.insureflow.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "insurance_policy")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsurancePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    @Pattern(regexp = "^POL-[0-9]{6}$", message = "Policy number must follow POL-XXXXXX format")
    private String policyNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private SystemAccount account;

    @Column(nullable = false, length = 100)
    private String coverageType;

    @Column(nullable = false, precision = 12, scale = 2)
    @Positive(message = "Premium amount must be positive")
    private BigDecimal premiumAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    @Positive(message = "Max coverage limit must be positive")
    private BigDecimal maxCoverageLimit;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal remainingLimit;

    @Column(nullable = false, length = 30)
    private String policyStatus; // PENDING, ACTIVE, EXPIRED, CANCELLED

    @Column(nullable = false)
    private LocalDate effectiveDate;

    @Column(nullable = false)
    private LocalDate expiryDate;

    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL)
    private List<RiskAssessment> assessments;

    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL)
    private List<ClaimSubmission> claims;
}"""
    add_code_block("InsurancePolicy.java", code_policy)

    code_claim_service = """package com.insureflow.service;

import com.insureflow.dto.ObservationDTO;
import com.insureflow.exception.BusinessValidationException;
import com.insureflow.exception.ResourceNotFoundException;
import com.insureflow.model.*;
import com.insureflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ClaimProcessingService {

    private final ClaimSubmissionRepository claimRepository;
    private final InsurancePolicyRepository policyRepository;
    private final ClaimDisbursementRepository disbursementRepository;

    @Transactional
    public ClaimSubmission adjudicateClaim(Long claimId, ObservationDTO observationDTO) {
        ClaimSubmission claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new ResourceNotFoundException("Claim notice not found with ID: " + claimId));

        if (!"SUBMITTED".equals(claim.getClaimStatus()) && !"UNDER_REVIEW".equals(claim.getClaimStatus())) {
            throw new BusinessValidationException("Claim is already adjudicated with status: " + claim.getClaimStatus());
        }

        // Acquire Pessimistic Write Lock on Policy Row to prevent concurrent over-disbursements
        InsurancePolicy policy = policyRepository.findByIdWithPessimisticWrite(claim.getPolicy().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Associated policy not found"));

        if (!"ACTIVE".equals(policy.getPolicyStatus())) {
            throw new BusinessValidationException("Cannot adjudicate claims against inactive policy contract");
        }

        if ("APPROVED".equalsIgnoreCase(observationDTO.getDecision())) {
            BigDecimal approvedPayout = observationDTO.getApprovedAmount() != null ? 
                observationDTO.getApprovedAmount() : claim.getRequestedPayout();

            if (policy.getRemainingLimit().compareTo(approvedPayout) < 0) {
                throw new BusinessValidationException("Requested payout $" + approvedPayout + 
                    " exceeds dynamic remaining capacity buffer $" + policy.getRemainingLimit());
            }

            // Deduct from policy remaining buffer atomically
            policy.setRemainingLimit(policy.getRemainingLimit().subtract(approvedPayout));
            policyRepository.save(policy);

            claim.setApprovedPayout(approvedPayout);
            claim.setClaimStatus("APPROVED");

            // Auto-schedule financial disbursement wire transfer
            ClaimDisbursement disbursement = ClaimDisbursement.builder()
                .claim(claim)
                .disbursementAmount(approvedPayout)
                .bankRoutingNumber("021000021")
                .bankAccountNumber("ACCT-" + claim.getClaimant().getId() + "-WIRE")
                .executionStatus("SCHEDULED")
                .build();
            disbursementRepository.save(disbursement);
        } else {
            claim.setClaimStatus("REJECTED");
            claim.setApprovedPayout(BigDecimal.ZERO);
        }

        return claimRepository.save(claim);
    }
}"""
    add_code_block("ClaimProcessingService.java", code_claim_service)

    code_policy_controller = """package com.insureflow.controller;

import com.insureflow.dto.TrialCreationDTO;
import com.insureflow.model.InsurancePolicy;
import com.insureflow.service.PolicyUnderwritingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyUnderwritingService policyService;

    @PostMapping
    @PreAuthorize("hasAnyRole('UNDERWRITER', 'INSURANCE_MANAGER')")
    public ResponseEntity<InsurancePolicy> createPolicy(@Valid @RequestBody TrialCreationDTO dto) {
        InsurancePolicy created = policyService.createSeedPolicy(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('UNDERWRITER', 'INSURANCE_MANAGER')")
    public ResponseEntity<List<InsurancePolicy>> getAllPolicies() {
        return ResponseEntity.ok(policyService.getAllPolicies());
    }

    @GetMapping("/my-policies")
    @PreAuthorize("hasRole('POLICYHOLDER')")
    public ResponseEntity<List<InsurancePolicy>> getMyPolicies(Authentication authentication) {
        return ResponseEntity.ok(policyService.getMyPoliciesByEmail(authentication.getName()));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('UNDERWRITER', 'INSURANCE_MANAGER')")
    public ResponseEntity<InsurancePolicy> activatePolicy(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.activatePolicy(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSURANCE_MANAGER', 'UNDERWRITER')")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}"""
    add_code_block("PolicyController.java", code_policy_controller)

    code_jwt_filter = """package com.insureflow.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            username = jwtUtil.extractUsername(token);
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (jwtUtil.validateToken(token, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}"""
    add_code_block("JwtAuthFilter.java", code_jwt_filter)

    code_react_claim = """import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function ClaimSubmissionForm({ policy, onClaimSubmitted }) {
  const [incidentDate, setIncidentDate] = useState('');
  const [requestedPayout, setRequestedPayout] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const { token } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (parseFloat(requestedPayout) > parseFloat(policy.remainingLimit)) {
      setErrorMsg(`Requested payout exceeds policy remaining buffer ($${policy.remainingLimit})`);
      return;
    }

    try {
      const payload = {
        policyId: policy.id,
        incidentDate,
        requestedPayout: parseFloat(requestedPayout),
        incidentDescription
      };
      const response = await axios.post('/api/v1/claims', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg(`Claim notice filed successfully! Assigned ID: ${response.data.claimNumber}`);
      if (onClaimSubmitted) onClaimSubmitted(response.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to file claim notice');
    }
  };

  return (
    <div className="claim-form-card">
      <h3>File Loss Intake Notice</h3>
      {errorMsg && <div className="alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert-success">{successMsg}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Policy Reference:</label>
          <input type="text" value={policy.policyNumber} disabled />
        </div>
        <div className="form-group">
          <label>Incident Date:</label>
          <input type="date" value={incidentDate} max={new Date().toISOString().split('T')[0]} 
                 onChange={(e) => setIncidentDate(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Requested Capital Payout ($):</label>
          <input type="number" step="0.01" value={requestedPayout} 
                 onChange={(e) => setRequestedPayout(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Loss Description & Police/Medical Records:</label>
          <textarea value={incidentDescription} rows="4" 
                    onChange={(e) => setIncidentDescription(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary">Submit Claim Notice</button>
      </form>
    </div>
  );
}"""
    add_code_block("ClaimSubmissionForm.jsx", code_react_claim)

    doc.add_page_break()

    # APPENDIX II – SCREENSHOTS
    add_h2("APPENDIX II – SCREENSHOTS")
    add_fig('assets/fig_a2_1_landing.png', "Fig. A.2.1. InsureFlow Platform Landing & Authentication Portal", width=Inches(5.6))
    add_fig('assets/fig_a2_2_policy.png', "Fig. A.2.2. Policy Provisioning & Underwriting Console", width=Inches(5.6))
    add_fig('assets/fig_a2_3_risk.png', "Fig. A.2.3. Risk Assessment & Actuarial Scoring Engine", width=Inches(5.6))
    add_fig('assets/fig_a2_4_claim_submit.png', "Fig. A.2.4. Claim Submission & Loss Intake Portal", width=Inches(5.6))
    add_fig('assets/fig_a2_5_adjudication.png', "Fig. A.2.5. Claim Adjudication & Capacity Settlement Console", width=Inches(5.6))
    add_fig('assets/fig_a2_6_disbursement.png', "Fig. A.2.6. Financial Disbursement & Wire Transfer Management", width=Inches(5.6))
    add_fig('assets/fig_a2_7_analytics.png', "Fig. A.2.7. Platform Analytics & Real-Time Operational Health", width=Inches(5.6))

    doc.add_page_break()

    # ==========================================
    # REFERENCES
    # ==========================================
    add_h1("REFERENCES")

    add_h3("Web References")
    web_refs = [
        "[1] Spring Boot Official Framework Documentation: https://spring.io/projects/spring-boot",
        "[2] Spring Security Architecture & JWT Integration: https://spring.io/projects/spring-security",
        "[3] ReactJS Official Documentation & Component Lifecycle: https://react.dev/learn",
        "[4] Redux Toolkit & State Management Guide: https://redux-toolkit.js.org/introduction/getting-started",
        "[5] MySQL Community Server 8.0 Reference Manual: https://dev.mysql.com/doc/refman/8.0/en/",
        "[6] Java JWT (JJWT) Cryptographic Token Library: https://github.com/jwtk/jjwt",
        "[7] Swagger & OpenAPI Specification: https://swagger.io/specification/",
        "[8] Hibernate ORM Concurrency and Pessimistic Locking: https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html"
    ]
    for r in web_refs:
        add_p(r, space_before=2, space_after=4)

    add_h3("Book References")
    book_refs = [
        "[1] Robert C. Martin (2008), Clean Code: A Handbook of Agile Software Craftsmanship, Prentice Hall.",
        "[2] Martin Fowler (2002), Patterns of Enterprise Application Architecture, Addison-Wesley Professional.",
        "[3] Eric Evans (2003), Domain-Driven Design: Tackling Complexity in the Heart of Software, Addison-Wesley.",
        "[4] Craig Walls (2016), Spring Boot in Action, Manning Publications.",
        "[5] Christian Bauer, Gavin King, and Gary Gregory (2015), Java Persistence with Hibernate, Manning Publications.",
        "[6] Kyle Simpson (2015), You Don't Know JS: Scope & Closures, O'Reilly Media.",
        "[7] Alex Banks and Eve Porcello (2020), Learning React: Modern Patterns for Developing React Apps, O'Reilly Media.",
        "[8] Sam Newman (2021), Building Microservices: Designing Fine-Grained Systems (2nd Edition), O'Reilly Media."
    ]
    for r in book_refs:
        add_p(r, space_before=2, space_after=4)

    output_path = "InsureFlow_Mini_Project_Report.docx"
    doc.save(output_path)
    print(f"Report successfully generated and saved to '{output_path}'.")

if __name__ == '__main__':
    build_insureflow_report()
