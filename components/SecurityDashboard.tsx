'use client';

import { useMemo } from 'react';
import { useSecrets } from '@/contexts/SecretsContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Clock, Key, CheckCircle2, TrendingUp } from 'lucide-react';
import {
  analyzeSecrets,
  getScoreInfo,
  getSeverityInfo,
  type SecurityReport,
} from '@/lib/security-analyzer';

export function SecurityDashboard() {
  const { secrets } = useSecrets();

  const report: SecurityReport = useMemo(() => {
    return analyzeSecrets(secrets);
  }, [secrets]);

  const scoreInfo = getScoreInfo(report.score.overall);

  if (secrets.length === 0) {
    return (
      <Card>
        <CardContent className="py-16">
          <div className="text-center space-y-4">
            <Shield className="w-16 h-16 mx-auto text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-400">No Secrets to Analyze</h3>
            <p className="text-sm text-slate-500">
              Add some secrets to see your security dashboard and get recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Security Score */}
      <Card className="glow-cyan">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-cyan-400" />
              Security Score
            </CardTitle>
            <Badge 
              variant={scoreInfo.badgeVariant} 
              className="text-lg px-4 py-1"
            >
              {report.score.overall}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
            <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-slate-400">Overall Security</span>
              <span className={`text-sm font-semibold ${scoreInfo.color}`}>
                {scoreInfo.label}
              </span>
            </div>
            <Progress 
              value={report.score.overall} 
              variant={scoreInfo.variant} 
            />
          </div>

          <div className="grid grid-cols-4 gap-3 pt-2">
            <div className="text-center">
              <div className="text-xl font-bold text-emerald-400">{report.score.strongPasswords}</div>
              <div className="text-xs text-slate-500">Strong</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-400">{report.score.weakPasswords}</div>
              <div className="text-xs text-slate-500">Weak</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-amber-400">{report.score.reusedPasswords}</div>
              <div className="text-xs text-slate-500">Reused</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-cyan-400">{report.score.oldPasswords}</div>
              <div className="text-xs text-slate-500">Old</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Issues */}
      {report.issues.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Security Issues ({report.issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.issues.map((issue) => {
              const severityInfo = getSeverityInfo(issue.severity);
              
              return (
                <Alert
                  key={issue.id}
                  variant={
                    issue.severity === 'critical' || issue.severity === 'high'
                      ? 'destructive'
                      : issue.severity === 'medium'
                      ? 'warning'
                      : 'info'
                  }
                  className={`${severityInfo.bgColor} py-3`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{severityInfo.icon}</span>
                    <div className="flex-1 min-w-0">
                      <AlertTitle className={`${severityInfo.color} text-sm`}>
                        {issue.title}
                      </AlertTitle>
                      <AlertDescription className="text-xs mt-1">
                        {issue.description}
                      </AlertDescription>
                      <div className="mt-1.5">
                        <Badge variant="secondary" className="text-xs py-0">
                          {issue.type === 'weak' && 'Weak Password'}
                          {issue.type === 'reused' && 'Reused Password'}
                          {issue.type === 'old' && 'Outdated Password'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Alert>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Security Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-lg">
                <Key className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-200">
                  {report.score.strongPasswords}
                </div>
                <div className="text-xs text-slate-400">Strong Passwords</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-200">
                  {report.issues.filter(i => i.severity === 'critical' || i.severity === 'high').length}
                </div>
                <div className="text-xs text-slate-400">Critical Issues</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-200">
                  {Math.round((report.score.strongPasswords / secrets.length) * 100)}%
                </div>
                <div className="text-xs text-slate-400">Security Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
