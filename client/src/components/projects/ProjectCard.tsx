import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Users, CheckSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Project {
  _id: string;
  name: string;
  description?: string;
  color: string;
  owner: any;
  taskCount?: number;
  completedCount?: number;
  members: Array<{ user: any; role: string }>;
}

interface ProjectCardProps {
  project: Project;
  taskCount?: number;
  completedCount?: number;
}

export const ProjectCard = ({
  project,
  taskCount = 0,
  completedCount = 0,
}: ProjectCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const ownerId = project.owner?._id || project.owner;
  const isOwner = ownerId === user?.id;

  const progress =
    taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  return (
    <Card
      hover
      onClick={() => navigate(`/projects/${project._id}`)}
      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white/70 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    >
      {/* TOP GRADIENT STRIP */}
      <div
        className="absolute top-0 left-0 w-full h-20 opacity-20"
        style={{
          background: `linear-gradient(135deg, ${project.color}, transparent)`,
        }}
      />

      {/* OWNER BADGE */}
      {isOwner && (
        <Badge
          variant="primary"
          size="sm"
          className="absolute top-3 right-3 z-10"
        >
          Owner
        </Badge>
      )}

      <div className="relative z-10 p-5 space-y-4">

        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-indigo-600 transition">
              {project.name}
            </h3>

            {project.description && (
              <p className="text-sm text-gray-500 mt-4 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>

          {/* PROJECT ICON */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* PROGRESS BAR */}
        {taskCount > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: project.color,
                }}
              />
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{project.members?.length || 1}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4" />
              <span>{taskCount}</span>
            </div>
          </div>

          {completedCount > 0 && (
            <Badge variant="success" size="sm">
              {completedCount} done
            </Badge>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between">

          {/* AVATAR STACK */}
          <div className="flex -space-x-2">
            {(project.members || []).slice(0, 3).map((member, idx) => (
              <div
                key={member.user?._id || idx}
                className="w-9 h-9 rounded-full border-2 border-white bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm"
                title={member.user?.name}
              >
                {member.user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            ))}

            {(project.members?.length || 0) > 3 && (
              <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-semibold">
                +{(project.members?.length || 0) - 3}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-1 text-gray-400 group-hover:text-indigo-600 transition">
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition">
              Open
            </span>
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>
    </Card>
  );
};



// import { Card } from '../common/Card';
// import { Badge } from '../common/Badge';
// import { Users, CheckSquare, ArrowRight } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// interface Project {
//   _id: string;
//   name: string;
//   description?: string;
//   color: string;
//   owner: any;
//   members: Array<{ user: any; role: string }>;
// }

// interface ProjectCardProps {
//   project: Project;
//   taskCount?: number;
//   completedCount?: number;
// }

// export const ProjectCard = ({ project, taskCount = 0, completedCount = 0 }: ProjectCardProps) => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const ownerId = project.owner?._id || project.owner;
//   const isOwner = ownerId === user?.id;

//   return (
//     <Card
//       hover
//       onClick={() => navigate(`/projects/${project._id}`)}
//       className="relative overflow-hidden"
//     >
//       <div
//         className="absolute top-0 left-0 w-full h-1"
//         style={{ backgroundColor: project.color }}
//       />
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex-1">
//           <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
//           {project.description && (
//             <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
//           )}
//         </div>
//         <div
//           className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg ml-4"
//           style={{ backgroundColor: project.color }}
//         >
//           {project.name.charAt(0).toUpperCase()}
//         </div>
//       </div>

//       <div className="flex items-center gap-4 mb-4">
//         <div className="flex items-center gap-1.5 text-sm text-gray-500">
//           <Users className="w-4 h-4" />
//           <span>{project.members?.length || 1}</span>
//         </div>
//         <div className="flex items-center gap-1.5 text-sm text-gray-500">
//           <CheckSquare className="w-4 h-4" />
//           <span>{taskCount} tasks</span>
//         </div>
//         {completedCount > 0 && (
//           <Badge variant="success" size="sm">
//             {completedCount} done
//           </Badge>
//         )}
//       </div>

//       <div className="flex items-center justify-between">
//         <div className="flex -space-x-2">
//           {(project.members || []).slice(0, 3).map((member, idx) => (
//             <div
//               key={member.user?._id || idx}
//               className="w-8 h-8 rounded-full border-2 border-white bg-primary flex items-center justify-center text-white text-xs font-medium"
//               title={member.user?.name}
//             >
//               {member.user?.name?.charAt(0).toUpperCase() || '?'}
//             </div>
//           ))}
//           {(project.members?.length || 0) > 3 && (
//             <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
//               +{(project.members?.length || 0) - 3}
//             </div>
//           )}
//         </div>
//         <ArrowRight className="w-5 h-5 text-gray-400" />
//       </div>

//       {isOwner && (
//         <Badge variant="primary" size="sm" className="absolute top-3 right-3">
//           Owner
//         </Badge>
//       )}
//     </Card>
//   );
// };
