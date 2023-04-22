import react from 'react';
import Image from 'next/image';
import Button from '../button';
import {
  IoLocationSharp,
  IoHomeSharp,
  IoBriefcaseSharp,
  IoBarbellSharp,
  IoDocumentAttachSharp,
  IoBookmarkSharp,
  IoPencilSharp,
} from 'react-icons/io5';
import { AiFillDelete } from 'react-icons/ai';
import { useRouter } from 'next/router';

const JobPost: React.FC = () => {
  const router = useRouter();
  return (
    <div className='flex h-full max-h-full max-w-full flex-col gap-2'>
      <div className='space-y-1 rounded-lg bg-white p-4'>
        <h1 className='flex-1 flex-col text-2xl font-bold'>Doctoral Student</h1>
        <div className='flex-1 flex-col text-lg font-semibold'>Concordia University</div>
        <div className='mt-1 mb-1 flex flex-row flex-wrap justify-start gap-2 font-semibold text-primary-500'>
          {/* Job Location */}
          <div className='flex items-center gap-2'>
            <IoLocationSharp />
            <div>Montreal, QC</div>
          </div>
          {/* Job Type */}
          <div className='flex items-center gap-2'>
            <IoBriefcaseSharp />
            <div>Full-time</div>
          </div>
          {/* Workplace Type */}
          <div className='flex items-center gap-2'>
            <IoHomeSharp />
            <div>Onsite</div>
          </div>
        </div>

        {/* Job Skills */}
        <div className='flex-1 flex-col'>
          <div className='flex items-center gap-2 text-primary-500'>
            <IoBarbellSharp />
            <div>Job Skills</div>
          </div>
          <div className='flex flex-wrap space-y-2 text-primary-100'>
            <div className='flex flex-row gap-1'>
              <div className='rounded-md bg-primary-100/20 px-2 py-1 text-xs font-semibold'>Python</div>
              <div className='rounded-md bg-primary-100/20 px-2 py-1 text-xs font-semibold'>PyTorch</div>
              <div className='rounded-md bg-primary-100/20 px-2 py-1 text-xs font-semibold'>JavaScript</div>
            </div>
          </div>
        </div>

        {/* Required Documents */}
        <div className='flex-1 flex-col'>
          <div className='flex items-center gap-2 text-primary-500'>
            <IoDocumentAttachSharp />
            <div>Required Documents</div>
          </div>
          <div className='flex flex-wrap space-y-2 text-primary-100'>
            <div className='flex flex-row gap-1'>
              <div className='rounded-md bg-primary-100/20 px-2 py-1 text-xs font-semibold'>Resume</div>
              <div className='rounded-md bg-primary-100/20 px-2 py-1 text-xs font-semibold'>Cover Letter</div>
            </div>
          </div>
        </div>

        {/* Apply Job Button.*/}
        <div className='mt-6 flex justify-start gap-3'>
          <Button className='flex h-10 w-20 p-1 text-white' type='submit'>
            <IoPencilSharp />
            Apply
          </Button>
          {/* Save Job Button */}
          <Button className='flex h-10 w-20 p-1 text-white' type='submit'>
            <IoBookmarkSharp />
            Save
          </Button>
          {/* Can see/use the delete job button only if it's a recruiter */}
          <Button
            className='hover-red-600 flex h-10 w-20 border-red-600 bg-red-600 p-1 text-white hover:border-red-300 hover:bg-red-300'
            type='submit'
          >
            <AiFillDelete />
            Delete
          </Button>
        </div>
      </div>
      {/* Job Description */}
      <div className='gap-4 rounded-lg bg-white p-4'>
        <h2 className='flex-1 flex-col text-xl font-bold'>What this job implies</h2>
        <div className='flex-1 flex-col '>
          As part of an R&D collaboration between Concordia University’s IN2GM Lab and Industry partners, this project
          provides an opportunity to research and develop novel paradigms, approaches, prototype tools, and evaluation
          results, and build systems that support the topic of Immersive Media Delivery over 5G Networks. The main
          objective of the research is to design an end-to-end AI-enabled immersive media transport system (including 1.
          media packaging, 2. media ingest process, 3. media delivery over the core and last-mile networks, and 4. media
          consumption at the client side), that respects standards set by IETF, MPEG, and 3GPP, can be used for various
          immersive applications such as virtual reality (VR), augmented reality (AR), XR (extended reality), and the
          metaverse. The program offers a competitive salary, and the selected Ph.D. students will be supervised by
          Professor Abdelhak Bentaleb, the head of the IN2GM Lab. The selected Ph.D. students will earn a doctorate
          degree in Computer Science from Concordia University’s Department of Computer Science and Software
          Engineering, part of the Gina Cody School of Engineering and Computer Science. Qualifications: Candidates must
          have completed their master's degree in the field of Computer Science, Computer Engineering, Communications,
          or a related discipline with good final scores or be near completion at the start date of the appointment.
          Excellent background in networking and media streaming protocols/formats, immersive media, wireless 5G
          networks, machine/deep learning (e.g., deep reinforcement learning), and mathematics. Excellent programming
          skills (e.g. Python, PyTorch, JavaScript, C, C++). Excellent English skills, both in written and oral form How
          to Apply? Applications should be addressed to Dr. Abdelhak Bentaleb, Assistant Professor of Computer Science
          in the CSSE Department at Concordia University: abdelhak.bentaleb@concordia.ca Applications must include the
          following: Letter of motivation (maximum 3 pages) explaining your interests related to this position. Outline
          your background, how you fit for the position, how you can contribute to the topics described, and explain
          what you did during your studies (e.g., project, published papers, etc.). A detailed curriculum vitae. Soft
          copies of degree certificates and transcripts from both bachelor's and master's degrees. Please include PhD
          Position [Application]: ‘Your-Name‘ in your email subject line to ensure a timely response. Equity and
          Diversity Statement: We value equity and diversity. We strongly encourage applications from all qualified
          candidates, including women, members of visible minorities, Indigenous persons, members of racial and ethnic
          minorities, persons with disabilities, and others who may contribute to diversification. About Concordia:
          Located in the vibrant and multicultural city of Montreal, Concordia University is among the most innovative
          universities in its approach to experiential learning, research, and education. Concordia is one of the three
          universities in Quebec where English is the primary language of instruction. It is the first university under
          50 years in Canada and the Computer Science and Software Engineering (CSSE) Department is ranked one of the
          top 10 CS departments in Canada. The CSSE Department is located in the “Quartier Concordia” neighborhood of
          Downtown Montreal where there are many options for direct transportation: metro, bus, or bike. It provides a
          suitable learning and research environment where students can flourish their skills. PageMaker including
          versions of Lorem Ipsum.
        </div>
      </div>
    </div>
  );
};
export default JobPost;
